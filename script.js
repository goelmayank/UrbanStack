'use strict';

/* global getAssetRegistry getqrpassRegistry getFactory */

/**
 *
 * @param {org.urbanstack.QRTransferToTransit} tt - model instance
 * @transaction
 */

async function onTransferToTransit(tt) {
    console.log('onTransferToTransit');

    //update the carrier of the QRPass to Transit Provider
    if (!tt.qrpass.carrier) {
        tt.qrpass.carrier = tt.mobilityAsset.owner;
    } else {
        throw new Error('QRPass is already being carried by a Transit Provider');
    }

    //save the QRPass
    const qr = await getAssetRegistry('org.urbanstack.QRPass');
    await qr.update(tt.qrpass);

    //add the QRPass to Trasit Provider QRPasses[]
    if (tt.mobilityAsset.owner.qrpasses) {
        tt.mobilityAsset.owner.qrpasses.push(tt.qrpass);
    } else {
        tt.mobilityAsset.owner.qrpasses = [tt.qrpass];
    }

    //save Trasit Provider
    const tp = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await tp.update(tt.mobilityAsset.owner);
}

/**
 *
 * @param {org.urbanstack.QRTransferToUser} tt - model instance
 * @transaction
 */
async function QRTransferToUser(tt) {
    console.log('QRTransferToUser');

    //update the carrier of the QRPass to null
    if (tt.qrpass.carrier) {
        tt.qrpass.carrier = null;
    } else {
        throw new Error('QRPass is not being carried by any Transit Provider');
    }

    //save the QRPass
    const qr = await getAssetRegistry('org.urbanstack.QRPass');
    await qr.update(tt.qrpass);

    //remove the QRPass from Transit Provider QRPasses[]
    tt.mobilityAsset.owner.qrpasses = tt.mobilityAsset.owner.qrpasses
        .filter(function (qrpass) {
            return qrpass.qrpassId !== tt.qrpass.qrpassId;
        });

    //save Transit Provider
    const user = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await user.update(tt.mobilityAsset.owner);
}
