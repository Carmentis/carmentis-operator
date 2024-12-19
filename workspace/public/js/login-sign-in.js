
Carmentis.registerNodeEndpoint('https://node.themis.carmentis.io');
Carmentis.registerDataEndpoint('http://localhost:3002/');

const applicationId = "D9BC240255985752F89A64C155B1660DF32920C05D9D529B000718E818E1F2E2"

/*
let sessionPrivateKey    = crypto.getRandomBytes(32),
    sessionPrivateKeyHex = uint8.toHexa(sessionPrivateKey),
    sessionPublicKey     = crypto.secp256k1.publicKeyFromPrivateKey(sessionPrivateKey),
    sessionPublicKeyHex  = uint8.toHexa(sessionPublicKey);
*/
Carmentis.registerDataEndpoint("http://localhost:3002/");

Carmentis.wallet.request({
    qrElementId: 'qr', // QRCode identifier
    type: 'signIn',
    applicationId: applicationId,
    data: {
        sessionPublicKey: "00000000000000000000000000000000"
    },
    allowReconnection: false,
    operatorURL: 'http://localhost:3002/',
}).then(answer => {
    if ( answer.success ) {
        window.location = "/home"
    }
}) ;


