import PortfolioModel from "./model";
import UserModel from "../users/model";
import NotificationService from "../notifications/service";
import DiscordService from "@/lib/discord";
import Constants from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';

export default class PortfolioService {
    static async createItem(data) {
        const item = {
            id: uuidv4(),
            userID: data.userID,
            title: data.title,
            description: data.description,
            imageUrls: data.imageUrls || [],
            createdAt: new Date(),
            likes: []
        };

        const createdItem = await PortfolioModel.createItem(item);

        // Post to Discord
        if (createdItem) {
            try {
                const discordMessage = {
                    content: `🎨 **New Showcase Project!**\n**${item.title}** by <@${data.discordId || 'Unknown'}>\n\n${item.description}`,
                    embeds: item.imageUrls.map(url => ({
                        image: { url }
                    }))
                };
                
                // If user doesn't have discordId, maybe just use name
                if (!data.discordId) {
                    let displayName = data.userName;
                    if (displayName === 'undefined undefined') {
                        displayName = 'Unknown User';
                    }
                    discordMessage.content = `🎨 **New Showcase Project!**\n**${item.title}** by **${displayName}**\n\n${item.description}`;
                }

                await DiscordService.sendChannelMessage(Constants.DISCORD_SHOWCASE_CHANNEL_ID, discordMessage);
            } catch (error) {
                console.error("Failed to post to Discord Showcase:", error);
            }
        }

        return createdItem;
    }

    static async getAllItems(filter, limit, skip, sort) {
        return await PortfolioModel.getAllItems(filter, limit, skip, sort);
    }

    static async toggleLike(id, userID) {
        const item = await PortfolioModel.getItemById(id);
        if (!item) throw new Error("Item not found");

        if (item.likes && item.likes.includes(userID)) {
            await PortfolioModel.unlikeItem(id, userID);
            return { liked: false };
        } else {
            await PortfolioModel.likeItem(id, userID);

            // Notify owner
            if (item.userID !== userID) {
                try {
                    const liker = await UserModel.getUserByQuery({ userID });
                    const likerName = liker ? `${liker.firstName} ${liker.lastName}` : "Someone";
                    
                    await NotificationService.create({
                        userID: item.userID,
                        type: 'info',
                        title: 'New Like',
                        message: `${likerName} liked your project "${item.title}"`,
                        link: `/showcase?highlight=${id}`,
                        metadata: { itemID: id, type: 'showcase_like' }
                    });
                } catch (error) {
                    console.error("Failed to send like notification:", error);
                }
            }

            return { liked: true };
        }
    }

    static async addComment(id, userID, text) {
        const user = await UserModel.getUserByQuery({ userID });
        if (!user) throw new Error("User not found");

        const comment = {
            id: uuidv4(),
            userID,
            text,
            createdAt: new Date(),
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image
            }
        };

        await PortfolioModel.addComment(id, comment);

        // Notify owner
        try {
            const item = await PortfolioModel.getItemById(id);
            if (item && item.userID !== userID) {
                await NotificationService.create({
                    userID: item.userID,
                    type: 'info',
                    title: 'New Comment',
                    message: `${user.firstName} ${user.lastName} commented on your project "${item.title}"`,
                    link: `/showcase?highlight=${id}`,
                    metadata: { itemID: id, type: 'showcase_comment' }
                });
            }
        } catch (error) {
            console.error("Failed to send comment notification:", error);
        }

        return comment;
    }
}
