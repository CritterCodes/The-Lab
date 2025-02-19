import { NextResponse } from "next/server";
import squareClient from "@/lib/square";
import { db } from "@/lib/database";
import UserService from "../users/service";
import { v4 as uuidv4 } from "uuid";

const catalogApi = squareClient.catalogApi;
const customersApi = squareClient.customersApi;
const subscriptionsApi = squareClient.subscriptionsApi;



// 🟢 GET: Retrieve Membership Plans
export async function GET() {
  try {
    console.log("📢 [GET] Fetching membership plans...");
    const { result } = await catalogApi.listCatalog(undefined, "SUBSCRIPTION_PLAN");

    if (!result.objects || !Array.isArray(result.objects) || result.objects.length === 0) {
      console.warn("⚠️ No membership plans found in Square.");
      return NextResponse.json({ error: "No membership plans found." }, { status: 404 });
    }

    console.log("🔹 Original Plans:", result.objects.length);

    // Extract plan data
    const plans = await Promise.all(result.objects.map(async (plan) => {
      const planId = String(plan.id);
      const planName = plan.subscriptionPlanData?.name || "Unnamed Plan";

      // Filter out inactive plan variations
      const activeVariations = plan.subscriptionPlanData?.subscriptionPlanVariations?.filter(
        (variant) => variant.presentAtAllLocations !== false
      ) || [];

      if (activeVariations.length === 0) {
        console.warn(`⚠️ No active variations found for plan: ${planName}`);
        return null; // Skip this plan if no active variations exist
      }

      // Process variations
      const variations = activeVariations.map(variant => {
        return {
          variationId: variant.id, // Plan Variation ID
          name: variant.subscriptionPlanVariationData?.name || "Unnamed Variation",
          cadence: variant.subscriptionPlanVariationData?.phases?.[0]?.cadence || "UNKNOWN",
        };
      });

      // Extract the eligible item ID for pricing
      const eligibleItemId = plan.subscriptionPlanData?.eligibleItemIds?.[0] || null;
      let price = 0;
      let currency = "USD";

      if (eligibleItemId) {
        try {
          // Fetch item price from Square Catalog
          const { result: itemResult } = await catalogApi.retrieveCatalogObject(eligibleItemId);
          const itemData = itemResult.object?.itemData?.variations?.[0]?.itemVariationData?.priceMoney;

          if (itemData) {
            price = Number(itemData.amount) / 100; // Convert from cents
            currency = itemData.currency || "USD";
          }
        } catch (error) {
          console.warn(`⚠️ Could not retrieve price for item ID: ${eligibleItemId}`);
        }
      }

      return {
        id: planId,
        name: planName,
        price,
        currency,
        variations, // Includes all valid variations (monthly/annual)
      };
    }));

    // Remove null entries (i.e., plans with no active variations)
    const filteredPlans = plans.filter((plan) => plan !== null);

    console.log(`✅ Processed ${filteredPlans.length} Membership Plans:`, JSON.stringify(filteredPlans, null, 2));

    return NextResponse.json(filteredPlans, { status: 200 });
  } catch (error) {
    console.error("❌ [GET] Error fetching membership plans:", error);
    return NextResponse.json({ error: "Failed to load membership plans." }, { status: 500 });
  }
}


export async function POST(req) {
  console.log("📢 [POST] Processing subscription request...");

  try {
    const { userID, planId } = await req.json();
    console.log(`🔍 [POST] User ID: ${userID}, Plan ID: ${planId}`);

    if (!userID || !planId) {
      console.warn("⚠️ [POST] Missing required parameters.");
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // Fetch user from DB
    let user = await db.dbUsers().findOne({ userID });

    if (!user) {
      console.warn("⚠️ [POST] User not found.");
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ✅ Create Square Customer if missing
    let squareCustomerId = user.squareCustomerId;
    if (!squareCustomerId) {
      console.log("📌 [POST] User is not linked to Square. Creating a new Square customer...");

      const customerBody = {
        idempotencyKey: uuidv4(),
        givenName: user.firstName || "Unknown",
        familyName: user.lastName || "User",
        emailAddress: user.email,
        referenceId: userID,
      };

      try {
        const { result } = await customersApi.createCustomer(customerBody);
        squareCustomerId = result.customer.id;

        // Store Square Customer ID in DB
        await db.dbUsers().updateOne({ userID }, { $set: { squareCustomerId } });

        console.log("✅ [POST] Square customer created:", result.customer);
      } catch (error) {
        console.error("❌ [POST] Failed to create Square customer:", error);
        return NextResponse.json({ error: "Failed to create Square customer." }, { status: 500 });
      }
    }

    // ✅ Fetch plan details from Square to get the `plan_variation_id`
    console.log("📤 [POST] Fetching plan variation ID...");
    const { result } = await catalogApi.listCatalog(undefined, "SUBSCRIPTION_PLAN");

    if (!result.objects || result.objects.length === 0) {
      console.error("❌ [POST] No subscription plans found.");
      return NextResponse.json({ error: "No subscription plans found." }, { status: 500 });
    }

    // Find the correct plan variation ID
    const plan = result.objects.find((p) => p.id === planId);
    if (!plan) {
      console.error("❌ [POST] Plan ID not found in Square.");
      return NextResponse.json({ error: "Plan ID not found." }, { status: 400 });
    }

    // Find the correct variation ID
    const planVariation = plan.subscriptionPlanData.subscriptionPlanVariations.find(
      (variation) => variation.present_at_all_locations === true
    );

    if (!planVariation) {
      console.error("❌ [POST] No valid plan variations available.");
      return NextResponse.json({ error: "No valid plan variations found." }, { status: 400 });
    }

    const planVariationId = planVariation.id;
    console.log(`✅ [POST] Found plan variation ID: ${planVariationId}`);

    // ✅ Proceed with subscription
    console.log("📤 [POST] Sending subscription request to Square...");
    const subscriptionBody = {
      idempotencyKey: uuidv4(),
      locationId: process.env.SQUARE_LOCATION_ID,
      customerId: squareCustomerId,
      planVariationId: planVariationId, // FIXED: Use planVariationId instead of planId
    };

    const { result: subscriptionResult } = await subscriptionsApi.createSubscription(subscriptionBody);

    if (!subscriptionResult.subscription) {
      console.error("❌ [POST] Subscription failed:", subscriptionResult);
      return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
    }

    console.log("✅ [POST] Subscription successful:", subscriptionResult.subscription);

    // ✅ Store active subscription in DB
    await db.dbUsers().updateOne(
      { userID },
      { $set: { membership: { id: planVariationId, status: "active" } } }
    );

    return NextResponse.json(
      { message: "Subscription successful!", membership: { id: planVariationId, status: "active" } },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [POST] Error subscribing user:", error);
    return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
  }
}

// 🔴 DELETE: Cancel User Membership
export async function DELETE(req) {
  console.log("📢 [DELETE] Processing membership cancellation...");
  try {
    const { userID } = await req.json();
    console.log(`🔍 [DELETE] User ID: ${userID}`);

    if (!userID) {
      console.warn("⚠️ [DELETE] Missing userID.");
      return NextResponse.json({ error: "Missing userID." }, { status: 400 });
    }

    const usersCollection = await db.dbUsers();
    const user = await usersCollection.findOne({ userID: userID });

    if (!user || !user.membership) {
      console.warn("⚠️ [DELETE] User has no active membership.");
      return NextResponse.json({ error: "User has no active membership." }, { status: 400 });
    }

    console.log("📤 [DELETE] Sending cancellation request to Square for:", user.membership.id);

    const { result } = await subscriptionsApi.cancelSubscription(user.membership.id);

    if (!result) {
      console.error("❌ [DELETE] Failed to cancel subscription.");
      return NextResponse.json({ error: "Failed to cancel subscription." }, { status: 500 });
    }

    console.log("✅ [DELETE] Subscription canceled successfully.");

    await usersCollection.updateOne({ userID: userID }, { $unset: { membership: "" } });

    return NextResponse.json({ message: "Membership canceled." }, { status: 200 });
  } catch (error) {
    console.error("❌ [DELETE] Error canceling membership:", error);
    return NextResponse.json({ error: "Failed to cancel membership." }, { status: 500 });
  }
}

// 🔵 PUT: Manage Locker Add-On
export async function PUT(req) {
  console.log("📢 [PUT] Processing locker update...");
  try {
    const { userID, action } = await req.json();
    console.log(`🔍 [PUT] User ID: ${userID}, Action: ${action}`);

    if (!userID || !["add", "remove"].includes(action)) {
      console.warn("⚠️ [PUT] Invalid request.");
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const usersCollection = await db.dbUsers();
    const user = await usersCollection.findOne({ userID: userID });

    if (!user) {
      console.warn("⚠️ [PUT] User not found.");
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    console.log(`📤 [PUT] Updating locker status for user ${userID}: ${action}`);

    await usersCollection.updateOne(
      { userID: userID },
      { $set: { locker: action === "add" } }
    );

    console.log(`✅ [PUT] Locker ${action === "add" ? "added" : "removed"} successfully.`);

    return NextResponse.json({
      message: `Locker ${action === "add" ? "added" : "removed"} successfully.`,
      locker: action === "add",
    }, { status: 200 });

  } catch (error) {
    console.error("❌ [PUT] Error updating locker:", error);
    return NextResponse.json({ error: "Failed to update locker." }, { status: 500 });
  }
}
