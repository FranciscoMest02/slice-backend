import apn from "apn";

const apnProvider = new apn.Provider({
    token: {
        key: "AuthKey_NXQ4M8MPX3.p8",
        keyId: "NXQ4M8MPX3",
        teamId: "A8CM88V36V"
    },
    production: false
});

function sendNotification(tokens) {
    const dailySlice = new apn.Notification();
    dailySlice.topic = "com.mattblanc.Slice";

      dailySlice.alert = {
        "title-loc-key": "SLICE_NOTIF_TITLE",
        "loc-key": "SLICE_NOTIF_BODY"
      };

    dailySlice.sound = "mannagg.caf"; // Use "default" to test basic delivery

    // Custom payload (goes outside the APS dictionary)
    dailySlice.payload = {
        slice: {
            note: "This is test data"
        }
    };

    apnProvider.send(dailySlice, tokens).then(result => {
        console.log("Sent:", result.sent.length);
        console.log("Failed:", result.failed.length);
        console.log("Failures:", result.failed);
    });
}

export { sendNotification }
