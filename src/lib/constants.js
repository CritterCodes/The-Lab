// lib/constants.js
const Constants = {
    USERS_COLLECTION: 'users',
    USERS_COLLECTION: 'plans',
    DEFAULT_PROJECTION: {
        _id: 0,
    },
    // Map Creator Types to Discord Role IDs
    CREATOR_ROLE_MAPPING: {
        'Hacker': '1418030549066580090',
        'Maker': '1453265292204576882',
        'Crafter': '1453265133366411275',
        'Artist': '1453264892059582536',
    },
    LAB_RATZ_ROLE_ID: '1348382987611275386',
    CHECKED_IN_ROLE_ID: '1454374170388598909',
    REQUIRED_VOLUNTEER_HOURS: 4,
    ONBOARDING_REWARDS: {
        REGISTER: 10,
        VERIFY_EMAIL: 10,
        COMPLETE_PROFILE: 10,
        SUBMIT_APPLICATION: 10,
        SUBSCRIBE: 25
    },
    BADGES: {
        FOUNDER: { id: 'founder', name: 'Founder', icon: '🚀', description: 'Early supporter of the lab.' },
        BOUNTY_HUNTER: { id: 'bounty_hunter', name: 'Bounty Hunter', icon: '🎯', description: 'Completed 5+ Bounties.' },
        VOLUNTEER_STAR: { id: 'volunteer_star', name: 'Volunteer Star', icon: '⭐', description: 'Logged 10+ Volunteer Hours.' },
        BUG_SQUASHER: { id: 'bug_squasher', name: 'Bug Squasher', icon: '🐛', description: 'Helped fix a bug in the system.', stakeReward: 25 },
        MAKER: { id: 'maker', name: 'Certified Maker', icon: '🛠️', description: 'Completed safety orientation.' },
        TRAINED_3D_PRINTER: { id: 'trained_3d_printer', name: '3D Printer Certified', icon: '🖨️', description: 'Trained on 3D Printers.' },
        TRAINED_CO2_LASER: { id: 'trained_co2_laser', name: 'CO2 Laser Certified', icon: '🔦', description: 'Trained on CO2 Laser.' },
        TRAINED_FIBER_LASER: { id: 'trained_fiber_laser', name: 'Fiber Laser Certified', icon: '⚡', description: 'Trained on Fiber Laser.' },
        SHOWCASE_PIONEER: { id: 'showcase_pioneer', name: 'Showcase Pioneer', icon: '📸', description: 'Posted first project to Showcase.', stakeReward: 10 },
        COMMUNITY_VOICE: { id: 'community_voice', name: 'Community Voice', icon: '🗣️', description: 'Left 3+ comments on projects.', stakeReward: 5 },
        LAB_REGULAR: { id: 'lab_regular', name: 'Lab Regular', icon: '📍', description: 'Checked in 5+ times.', stakeReward: 5 }
    },
    DISCORD_SHOWCASE_CHANNEL_ID: '1454353592755687575'
};

export default Constants;
