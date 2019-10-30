import { Managers, Utils } from "@arkecosystem/crypto";

import { assert } from "./assert";

// todo: review the implementation
export const calculate = (height: number): string => {
    const config: Record<string, any> = assert.defined(Managers.configManager.all());

    const { genesisBlock, milestones } = config;

    const totalAmount: Utils.BigNumber = Utils.BigNumber.make(genesisBlock.totalAmount);

    if (height === 0 || milestones.length === 0) {
        return totalAmount.toFixed();
    }

    let rewards: Utils.BigNumber = Utils.BigNumber.ZERO;
    let currentHeight = 0;
    let constantIndex = 0;

    while (currentHeight < height) {
        const constants = milestones[constantIndex];
        const nextConstants = milestones[constantIndex + 1];

        let heightJump: number = height - currentHeight;

        if (nextConstants && height >= nextConstants.height && currentHeight < nextConstants.height - 1) {
            heightJump = nextConstants.height - 1 - currentHeight;
            constantIndex += 1;
        }

        currentHeight += heightJump;

        if (currentHeight >= constants.height) {
            rewards = rewards.plus(Utils.BigNumber.make(constants.reward).times(heightJump));
        }
    }

    return totalAmount.plus(rewards).toFixed();
};