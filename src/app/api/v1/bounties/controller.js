import BountyService from "./service";

export default class BountyController {
    static async createBounty(req) {
        try {
            const data = await req.json();
            const bounty = await BountyService.createBounty(data);
            return new Response(JSON.stringify({ bounty }), { status: 201 });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    static async getAllBounties(req) {
        try {
            const { searchParams } = new URL(req.url);
            const status = searchParams.get('status');
            const bounties = await BountyService.getAllBounties(status);
            return new Response(JSON.stringify({ bounties }), { status: 200 });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    static async updateBounty(req) {
        try {
            const { searchParams } = new URL(req.url);
            const bountyID = searchParams.get('bountyID');
            const action = searchParams.get('action'); // assign, submit, verify, cancel
            const data = await req.json();

            if (!bountyID) return new Response(JSON.stringify({ error: "Bounty ID required" }), { status: 400 });

            let result;
            switch (action) {
                case 'assign':
                    result = await BountyService.assignBounty(bountyID, data.userID);
                    break;
                case 'submit':
                    result = await BountyService.submitBounty(bountyID, data.userID, data.submission);
                    break;
                case 'verify':
                    result = await BountyService.verifyBounty(bountyID, data.verifierID);
                    break;
                case 'cancel':
                    result = await BountyService.cancelBounty(bountyID, data.userID);
                    break;
                default:
                    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
            }

            return new Response(JSON.stringify({ success: true, result }), { status: 200 });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }
}
