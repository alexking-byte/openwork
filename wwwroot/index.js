// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot
// Import required packages
const path = require('path');
const restify = require('restify');

// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');

const { QnABot } = require('./bots/QnABot');
const { RootDialog } = require('./dialogs/rootDialog');

// Note: Ensure you have a .env file and include QnAMakerKnowledgeBaseId, QnAMakerEndpointKey and QnAMakerHost.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }.`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry 
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Define the state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

var endpointHostName = process.env.QnAEndpointHostName;
if (!endpointHostName.startsWith('https://')) {
    endpointHostName = 'https://' + endpointHostName;
}

if (!endpointHostName.includes('/v5.0') && !endpointHostName.endsWith('/qnamaker')) {
    endpointHostName = endpointHostName + '/qnamaker';
}

var endpointKey = process.env.QnAEndpointKey;

if (!endpointKey || 0 === endpointKey.length)
{
   // To support backward compatibility for Key Names
    endpointKey = process.env.QnAAuthKey;
}

// Create the main dialog.
const dialog = new RootDialog(process.env.QnAKnowledgebaseId, endpointKey, endpointHostName);

// Create the bot's main handler.
const bot = new QnABot(conversationState, userState, dialog);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (turnContext) => {
        // Route the message to the bot's main handler.
        await bot.run(turnContext);
    });
});

// SIG // Begin signature block
// SIG // MIInJwYJKoZIhvcNAQcCoIInGDCCJxQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // QDiVbzP1MVqkl31QeSYAE32O0JPtWcKcRIHgIO10oe+g
// SIG // ghFlMIIIdzCCB1+gAwIBAgITNgAAATl4xjn15Xcn6gAB
// SIG // AAABOTANBgkqhkiG9w0BAQsFADBBMRMwEQYKCZImiZPy
// SIG // LGQBGRYDR0JMMRMwEQYKCZImiZPyLGQBGRYDQU1FMRUw
// SIG // EwYDVQQDEwxBTUUgQ1MgQ0EgMDEwHhcNMjAxMDIxMjAz
// SIG // OTA2WhcNMjEwOTE1MjE0MzAzWjAkMSIwIAYDVQQDExlN
// SIG // aWNyb3NvZnQgQXp1cmUgQ29kZSBTaWduMIIBIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr7X+kRvV9WxV
// SIG // y0Dsy7gNOpOYAYYsy1kN/5upyCjsKDbLvTfrPcrfmRka
// SIG // W2Ww7QZrQHqIt3Nlyvb39Md7Kt9hljz7/qcemu7uebUP
// SIG // ZauHr1+kDcT4ax/vpbZVLbIolZlfd+P/heQf+9bCdTca
// SIG // /PTrBMVdW+RMuy4ipBMMaU0cZTslF3+DokL0w8xtCOwL
// SIG // HieEcTstt7S54fNuvKZLnGNj20ixWKESBtWRjYHIXKay
// SIG // /rokS7gs+L2V34nUKFrrN04WPPpmLpQ/AGkOWbZ7sM0h
// SIG // 7c8WJv4Ojnkg7H+MRXqdA2CwN8zYijuAr5szUYyW3INQ
// SIG // ZuzqQ3vwki0lhuWqKlvl+QIDAQABo4IFgzCCBX8wKQYJ
// SIG // KwYBBAGCNxUKBBwwGjAMBgorBgEEAYI3WwEBMAoGCCsG
// SIG // AQUFBwMDMD0GCSsGAQQBgjcVBwQwMC4GJisGAQQBgjcV
// SIG // CIaQ4w2E1bR4hPGLPoWb3RbOnRKBYIPdzWaGlIwyAgFk
// SIG // AgEMMIICdgYIKwYBBQUHAQEEggJoMIICZDBiBggrBgEF
// SIG // BQcwAoZWaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3Br
// SIG // aWluZnJhL0NlcnRzL0JZMlBLSUNTQ0EwMS5BTUUuR0JM
// SIG // X0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQwUgYIKwYB
// SIG // BQUHMAKGRmh0dHA6Ly9jcmwxLmFtZS5nYmwvYWlhL0JZ
// SIG // MlBLSUNTQ0EwMS5BTUUuR0JMX0FNRSUyMENTJTIwQ0El
// SIG // MjAwMSgxKS5jcnQwUgYIKwYBBQUHMAKGRmh0dHA6Ly9j
// SIG // cmwyLmFtZS5nYmwvYWlhL0JZMlBLSUNTQ0EwMS5BTUUu
// SIG // R0JMX0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQwUgYI
// SIG // KwYBBQUHMAKGRmh0dHA6Ly9jcmwzLmFtZS5nYmwvYWlh
// SIG // L0JZMlBLSUNTQ0EwMS5BTUUuR0JMX0FNRSUyMENTJTIw
// SIG // Q0ElMjAwMSgxKS5jcnQwUgYIKwYBBQUHMAKGRmh0dHA6
// SIG // Ly9jcmw0LmFtZS5nYmwvYWlhL0JZMlBLSUNTQ0EwMS5B
// SIG // TUUuR0JMX0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQw
// SIG // ga0GCCsGAQUFBzAChoGgbGRhcDovLy9DTj1BTUUlMjBD
// SIG // UyUyMENBJTIwMDEsQ049QUlBLENOPVB1YmxpYyUyMEtl
// SIG // eSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZp
// SIG // Z3VyYXRpb24sREM9QU1FLERDPUdCTD9jQUNlcnRpZmlj
// SIG // YXRlP2Jhc2U/b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlv
// SIG // bkF1dGhvcml0eTAdBgNVHQ4EFgQUUGrH1hbhlmeE4x4+
// SIG // xNBviWC5XYMwDgYDVR0PAQH/BAQDAgeAMFAGA1UdEQRJ
// SIG // MEekRTBDMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0
// SIG // aW9ucyBQdWVydG8gUmljbzEWMBQGA1UEBRMNMjM2MTY3
// SIG // KzQ2MjUxNjCCAdQGA1UdHwSCAcswggHHMIIBw6CCAb+g
// SIG // ggG7hjxodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtp
// SIG // aW5mcmEvQ1JML0FNRSUyMENTJTIwQ0ElMjAwMS5jcmyG
// SIG // Lmh0dHA6Ly9jcmwxLmFtZS5nYmwvY3JsL0FNRSUyMENT
// SIG // JTIwQ0ElMjAwMS5jcmyGLmh0dHA6Ly9jcmwyLmFtZS5n
// SIG // YmwvY3JsL0FNRSUyMENTJTIwQ0ElMjAwMS5jcmyGLmh0
// SIG // dHA6Ly9jcmwzLmFtZS5nYmwvY3JsL0FNRSUyMENTJTIw
// SIG // Q0ElMjAwMS5jcmyGLmh0dHA6Ly9jcmw0LmFtZS5nYmwv
// SIG // Y3JsL0FNRSUyMENTJTIwQ0ElMjAwMS5jcmyGgbpsZGFw
// SIG // Oi8vL0NOPUFNRSUyMENTJTIwQ0ElMjAwMSxDTj1CWTJQ
// SIG // S0lDU0NBMDEsQ049Q0RQLENOPVB1YmxpYyUyMEtleSUy
// SIG // MFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3Vy
// SIG // YXRpb24sREM9QU1FLERDPUdCTD9jZXJ0aWZpY2F0ZVJl
// SIG // dm9jYXRpb25MaXN0P2Jhc2U/b2JqZWN0Q2xhc3M9Y1JM
// SIG // RGlzdHJpYnV0aW9uUG9pbnQwHwYDVR0jBBgwFoAUG2ai
// SIG // Gfyb66XahI8YmOkQpMN7kr0wHwYDVR0lBBgwFgYKKwYB
// SIG // BAGCN1sBAQYIKwYBBQUHAwMwDQYJKoZIhvcNAQELBQAD
// SIG // ggEBAKxTTHwCUra3f91eISJ03YxKPwi2AGPGF/36BgJs
// SIG // pOja4xMd7hTdLCZkd6kdIgYIEt0gYlIuKGfl5PPg41Z5
// SIG // yRZ/RYZrv5AdsE+GSo442XlkTj3E7FJ0YLNfjoSk1m19
// SIG // hJ4PKB9wqtKkfS2jk/xEuRI3ffEtY6ulmfAfCnTR4NHf
// SIG // lRgLcLbPhN7rvDJFDOa1LpJjx1uwQvLbZoCnl2YiIi1e
// SIG // E9Ss8QTDDYNJWO4hW0OX5I+YS2tRNFr7BjHDBjjMEVFc
// SIG // FcJehfDi/GlGOYu7aQLs+eF1UuFtYKz8kyQ2ntagdfR+
// SIG // Sb6k8DzzZt9CaxRqUf1/0hkIUTrKA+FdbbwifLQwggjm
// SIG // MIIGzqADAgECAhMfAAAAFLTFH8bygL5xAAAAAAAUMA0G
// SIG // CSqGSIb3DQEBCwUAMDwxEzARBgoJkiaJk/IsZAEZFgNH
// SIG // QkwxEzARBgoJkiaJk/IsZAEZFgNBTUUxEDAOBgNVBAMT
// SIG // B2FtZXJvb3QwHhcNMTYwOTE1MjEzMzAzWhcNMjEwOTE1
// SIG // MjE0MzAzWjBBMRMwEQYKCZImiZPyLGQBGRYDR0JMMRMw
// SIG // EQYKCZImiZPyLGQBGRYDQU1FMRUwEwYDVQQDEwxBTUUg
// SIG // Q1MgQ0EgMDEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQDVV4EC1vn60PcbgLndN80k3GZh/OGJcq0p
// SIG // DNIbG5q/rrRtNLVUR4MONKcWGyaeVvoaQ8J5iYInBaBk
// SIG // az7ehYnzJp3f/9Wg/31tcbxrPNMmZPY8UzXIrFRdQmCL
// SIG // sj3LcLiWX8BN8HBsYZFcP7Y92R2VWnEpbN40Q9XBsK3F
// SIG // aNSEevoRzL1Ho7beP7b9FJlKB/Nhy0PMNaE1/Q+8Y9+W
// SIG // bfU9KTj6jNxrffv87O7T6doMqDmL/MUeF9IlmSrl088b
// SIG // oLzAOt2LAeHobkgasx3ZBeea8R+O2k+oT4bwx5ZuzNpb
// SIG // GXESNAlALo8HCf7xC3hWqVzRqbdnd8HDyTNG6c6zwyf/
// SIG // AgMBAAGjggTaMIIE1jAQBgkrBgEEAYI3FQEEAwIBATAj
// SIG // BgkrBgEEAYI3FQIEFgQUkfwzzkKe9pPm4n1U1wgYu7jX
// SIG // cWUwHQYDVR0OBBYEFBtmohn8m+ul2oSPGJjpEKTDe5K9
// SIG // MIIBBAYDVR0lBIH8MIH5BgcrBgEFAgMFBggrBgEFBQcD
// SIG // AQYIKwYBBQUHAwIGCisGAQQBgjcUAgEGCSsGAQQBgjcV
// SIG // BgYKKwYBBAGCNwoDDAYJKwYBBAGCNxUGBggrBgEFBQcD
// SIG // CQYIKwYBBQUIAgIGCisGAQQBgjdAAQEGCysGAQQBgjcK
// SIG // AwQBBgorBgEEAYI3CgMEBgkrBgEEAYI3FQUGCisGAQQB
// SIG // gjcUAgIGCisGAQQBgjcUAgMGCCsGAQUFBwMDBgorBgEE
// SIG // AYI3WwEBBgorBgEEAYI3WwIBBgorBgEEAYI3WwMBBgor
// SIG // BgEEAYI3WwUBBgorBgEEAYI3WwQBBgorBgEEAYI3WwQC
// SIG // MBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
// SIG // DwQEAwIBhjASBgNVHRMBAf8ECDAGAQH/AgEAMB8GA1Ud
// SIG // IwQYMBaAFCleUV5krjS566ycDaeMdQHRCQsoMIIBaAYD
// SIG // VR0fBIIBXzCCAVswggFXoIIBU6CCAU+GI2h0dHA6Ly9j
// SIG // cmwxLmFtZS5nYmwvY3JsL2FtZXJvb3QuY3JshjFodHRw
// SIG // Oi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpaW5mcmEvY3Js
// SIG // L2FtZXJvb3QuY3JshiNodHRwOi8vY3JsMi5hbWUuZ2Js
// SIG // L2NybC9hbWVyb290LmNybIYjaHR0cDovL2NybDMuYW1l
// SIG // LmdibC9jcmwvYW1lcm9vdC5jcmyGgapsZGFwOi8vL0NO
// SIG // PWFtZXJvb3QsQ049QU1FUk9PVCxDTj1DRFAsQ049UHVi
// SIG // bGljJTIwS2V5JTIwU2VydmljZXMsQ049U2VydmljZXMs
// SIG // Q049Q29uZmlndXJhdGlvbixEQz1BTUUsREM9R0JMP2Nl
// SIG // cnRpZmljYXRlUmV2b2NhdGlvbkxpc3Q/YmFzZT9vYmpl
// SIG // Y3RDbGFzcz1jUkxEaXN0cmlidXRpb25Qb2ludDCCAasG
// SIG // CCsGAQUFBwEBBIIBnTCCAZkwNwYIKwYBBQUHMAKGK2h0
// SIG // dHA6Ly9jcmwxLmFtZS5nYmwvYWlhL0FNRVJPT1RfYW1l
// SIG // cm9vdC5jcnQwRwYIKwYBBQUHMAKGO2h0dHA6Ly9jcmwu
// SIG // bWljcm9zb2Z0LmNvbS9wa2lpbmZyYS9jZXJ0cy9BTUVS
// SIG // T09UX2FtZXJvb3QuY3J0MDcGCCsGAQUFBzAChitodHRw
// SIG // Oi8vY3JsMi5hbWUuZ2JsL2FpYS9BTUVST09UX2FtZXJv
// SIG // b3QuY3J0MDcGCCsGAQUFBzAChitodHRwOi8vY3JsMy5h
// SIG // bWUuZ2JsL2FpYS9BTUVST09UX2FtZXJvb3QuY3J0MIGi
// SIG // BggrBgEFBQcwAoaBlWxkYXA6Ly8vQ049YW1lcm9vdCxD
// SIG // Tj1BSUEsQ049UHVibGljJTIwS2V5JTIwU2VydmljZXMs
// SIG // Q049U2VydmljZXMsQ049Q29uZmlndXJhdGlvbixEQz1B
// SIG // TUUsREM9R0JMP2NBQ2VydGlmaWNhdGU/YmFzZT9vYmpl
// SIG // Y3RDbGFzcz1jZXJ0aWZpY2F0aW9uQXV0aG9yaXR5MA0G
// SIG // CSqGSIb3DQEBCwUAA4ICAQAot0qGmo8fpAFozcIA6pCL
// SIG // ygDhZB5ktbdA5c2ZabtQDTXwNARrXJOoRBu4Pk6VHVa7
// SIG // 8Xbz0OZc1N2xkzgZMoRpl6EiJVoygu8Qm27mHoJPJ9ao
// SIG // 9603I4mpHWwaqh3RfCfn8b/NxNhLGfkrc3wp2VwOtkAj
// SIG // J+rfJoQlgcacD14n9/VGt9smB6j9ECEgJy0443B+mwFd
// SIG // yCJO5OaUP+TQOqiC/MmA+r0Y6QjJf93GTsiQ/Nf+fjzi
// SIG // zTMdHggpTnxTcbWg9JCZnk4cC+AdoQBKR03kTbQfIm/n
// SIG // M3t275BjTx8j5UhyLqlqAt9cdhpNfdkn8xQz1dT6hTnL
// SIG // iowvNOPUkgbQtV+4crzKgHuHaKfJN7tufqHYbw3FnTZo
// SIG // pnTFr6f8mehco2xpU8bVKhO4i0yxdXmlC0hKGwGqdeoW
// SIG // NjdskyUyEih8xyOK47BEJb6mtn4+hi8TY/4wvuCzcvrk
// SIG // Zn0F0oXd9JbdO+ak66M9DbevNKV71YbEUnTZ81toX0Lt
// SIG // sbji4PMyhlTg/669BoHsoTg4yoC9hh8XLW2/V2lUg3+q
// SIG // HHQf/2g2I4mm5lnf1mJsu30NduyrmrDIeZ0ldqKzHAHn
// SIG // fAmyFSNzWLvrGoU9Q0ZvwRlDdoUqXbD0Hju98GL6dTew
// SIG // 3S2mcs+17DgsdargsEPm6I1lUE5iixnoEqFKWTX5j/TL
// SIG // UjGCFRowghUWAgEBMFgwQTETMBEGCgmSJomT8ixkARkW
// SIG // A0dCTDETMBEGCgmSJomT8ixkARkWA0FNRTEVMBMGA1UE
// SIG // AxMMQU1FIENTIENBIDAxAhM2AAABOXjGOfXldyfqAAEA
// SIG // AAE5MA0GCWCGSAFlAwQCAQUAoIGuMBkGCSqGSIb3DQEJ
// SIG // AzEMBgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAM
// SIG // BgorBgEEAYI3AgEVMC8GCSqGSIb3DQEJBDEiBCDRXzko
// SIG // 6miAbur49Kz3dXHe7DQW1/W+SYySwBMtbzTetzBCBgor
// SIG // BgEEAYI3AgEMMTQwMqAUgBIATQBpAGMAcgBvAHMAbwBm
// SIG // AHShGoAYaHR0cDovL3d3dy5taWNyb3NvZnQuY29tMA0G
// SIG // CSqGSIb3DQEBAQUABIIBAF2mXNUuzn8T107fQ4nVXvYv
// SIG // REX+5w15ba03vdV/ugj5LdyToQ25j78IBxCkWdocnNJO
// SIG // 5BPC8caFAKV2qIdEwhWBaiv6M+sWmaH73WpTkZd0a937
// SIG // DNKtcoW6kmdBAY6xH/dcdYKwOIMpqXmhx1EFqvOco3sE
// SIG // 3W5Co5l8R/l22URB9oKbotu3NijiybRWWlcAvpjVpXxd
// SIG // beL0KjRY7H6FD9oMHhygmeO5WLZ/5xrHrbtAh/GSfaOF
// SIG // COmLzUeintPjgqeReFMHEq38XxYkjkHRyhRPSwFM/JdH
// SIG // Olc03ynK/OaFnt8wzqOY82r1sl98uNmi3vdLGpR+TKg8
// SIG // YR3y+pqdkKChghLiMIIS3gYKKwYBBAGCNwMDATGCEs4w
// SIG // ghLKBgkqhkiG9w0BBwKgghK7MIIStwIBAzEPMA0GCWCG
// SIG // SAFlAwQCAQUAMIIBUQYLKoZIhvcNAQkQAQSgggFABIIB
// SIG // PDCCATgCAQEGCisGAQQBhFkKAwEwMTANBglghkgBZQME
// SIG // AgEFAAQgJNhKJxySEelv+7n6lbD6nPle3iIYPhPQJmMo
// SIG // o4BT1/gCBmCuW23XiBgTMjAyMTA2MTUyMjQwNTkuMjc2
// SIG // WjAEgAIB9KCB0KSBzTCByjELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046
// SIG // MjI2NC1FMzNFLTc4MEMxJTAjBgNVBAMTHE1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFNlcnZpY2Wggg45MIIE8TCCA9mg
// SIG // AwIBAgITMwAAAUqk9zHE/yKiSQAAAAABSjANBgkqhkiG
// SIG // 9w0BAQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MDAeFw0yMDExMTIxODI1NThaFw0yMjAyMTExODI1NTha
// SIG // MIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYDVQQLExxN
// SIG // aWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25zMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjoyMjY0LUUzM0UtNzgw
// SIG // QzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
// SIG // AQoCggEBAN7KKGZkolgsvVEaNKMTVZZgEl8ohsLgHR4g
// SIG // UFWLZvWzLbegDoRItpfFd+9maW2hPFlgT+wv7lxf6OB4
// SIG // HFYZgHfIpcZhGU6/ebsymXYAmAKzKph71pxJU5F228YT
// SIG // STLcoSAIUNBZVdTEIZILEPT5gI77Ysu7YKMufSmiZPzq
// SIG // YlkEX2/dHhOcoo90zgIJRTG1u2kF7w6a7D50yHKE46eG
// SIG // EwqwjExERCCNtFBDQrTfYID/Icj0zKikYjiJRaaPNjnv
// SIG // BaRJ/eFkGz8gD2XyYXjlsNjDGPaGPQTt/Rm3nrxcyXGy
// SIG // CIIhWdBMXMTLl7BMDKKeLBQ0d6pFfS1LRJo+paKKBiUC
// SIG // AwEAAaOCARswggEXMB0GA1UdDgQWBBRxjGEYMfrAhjWK
// SIG // k/99frgmKqk/4TAfBgNVHSMEGDAWgBTVYzpcijGQ80N7
// SIG // fEYbxTNoWoVtVTBWBgNVHR8ETzBNMEugSaBHhkVodHRw
// SIG // Oi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9k
// SIG // dWN0cy9NaWNUaW1TdGFQQ0FfMjAxMC0wNy0wMS5jcmww
// SIG // WgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01p
// SIG // Y1RpbVN0YVBDQV8yMDEwLTA3LTAxLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQBRC67dRjgFFS9kv72Vfe8gQ+Hg
// SIG // 3FpX2TYyOq4nrtPq9D36Udydr2ibZy5n7LphXvW20bDT
// SIG // ugUHiwuyfWnmyc2oEevo+SrNCzxXcj59Wv9lQpBgtL6O
// SIG // M56x+v1zbNzp/moMwk3UvysE5af5rktfFtPx6apqcjU1
// SIG // IDt09hX80ZAzqPflPPyC5Cj3J8DQilQz2/TzSZvcbgCM
// SIG // 9vuwLu9p9bZhJemNP++3LrHkdycfHZf3jv7QBAigEvyV
// SIG // b2mrnlomFIKCyJW1cOrBjIqyntQt5PK8zKxX/yZlyiRb
// SIG // r8c0DQw8tYpXeyorgoVet9sAF+t3g/cYzVogW4qwhuyZ
// SIG // mEmTlTSKMIIGcTCCBFmgAwIBAgIKYQmBKgAAAAAAAjAN
// SIG // BgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlm
// SIG // aWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMTAwNzAxMjEz
// SIG // NjU1WhcNMjUwNzAxMjE0NjU1WjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDCCASIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggEPADCCAQoCggEBAKkdDbx3EYo6IOz8E5f1+n9plGt0
// SIG // VBDVpQoAgoX77XxoSyxfxcPlYcJ2tz5mK1vwFVMnBDEf
// SIG // QRsalR3OCROOfGEwWbEwRA/xYIiEVEMM1024OAizQt2T
// SIG // rNZzMFcmgqNFDdDq9UeBzb8kYDJYYEbyWEeGMoQedGFn
// SIG // kV+BVLHPk0ySwcSmXdFhE24oxhr5hoC732H8RsEnHSRn
// SIG // EnIaIYqvS2SJUGKxXf13Hz3wV3WsvYpCTUBR0Q+cBj5n
// SIG // f/VmwAOWRH7v0Ev9buWayrGo8noqCjHw2k4GkbaICDXo
// SIG // eByw6ZnNPOcvRLqn9NxkvaQBwSAJk3jN/LzAyURdXhac
// SIG // AQVPIk0CAwEAAaOCAeYwggHiMBAGCSsGAQQBgjcVAQQD
// SIG // AgEAMB0GA1UdDgQWBBTVYzpcijGQ80N7fEYbxTNoWoVt
// SIG // VTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNV
// SIG // HQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSME
// SIG // GDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBWBgNVHR8E
// SIG // TzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXRf
// SIG // MjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUHAQEETjBMMEoG
// SIG // CCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2
// SIG // LTIzLmNydDCBoAYDVR0gAQH/BIGVMIGSMIGPBgkrBgEE
// SIG // AYI3LgMwgYEwPQYIKwYBBQUHAgEWMWh0dHA6Ly93d3cu
// SIG // bWljcm9zb2Z0LmNvbS9QS0kvZG9jcy9DUFMvZGVmYXVs
// SIG // dC5odG0wQAYIKwYBBQUHAgIwNB4yIB0ATABlAGcAYQBs
// SIG // AF8AUABvAGwAaQBjAHkAXwBTAHQAYQB0AGUAbQBlAG4A
// SIG // dAAuIB0wDQYJKoZIhvcNAQELBQADggIBAAfmiFEN4sbg
// SIG // mD+BcQM9naOhIW+z66bM9TG+zwXiqf76V20ZMLPCxWbJ
// SIG // at/15/B4vceoniXj+bzta1RXCCtRgkQS+7lTjMz0YBKK
// SIG // dsxAQEGb3FwX/1z5Xhc1mCRWS3TvQhDIr79/xn/yN31a
// SIG // PxzymXlKkVIArzgPF/UveYFl2am1a+THzvbKegBvSzBE
// SIG // JCI8z+0DpZaPWSm8tv0E4XCfMkon/VWvL/625Y4zu2Jf
// SIG // mttXQOnxzplmkIz/amJ/3cVKC5Em4jnsGUpxY517IW3D
// SIG // nKOiPPp/fZZqkHimbdLhnPkd/DjYlPTGpQqWhqS9nhqu
// SIG // BEKDuLWAmyI4ILUl5WTs9/S/fmNZJQ96LjlXdqJxqgaK
// SIG // D4kWumGnEcua2A5HmoDF0M2n0O99g/DhO3EJ3110mCII
// SIG // YdqwUB5vvfHhAN/nMQekkzr3ZUd46PioSKv33nJ+YWtv
// SIG // d6mBy6cJrDm77MbL2IK0cs0d9LiFAR6A+xuJKlQ5slva
// SIG // yA1VmXqHczsI5pgt6o3gMy4SKfXAL1QnIffIrE7aKLix
// SIG // qduWsqdCosnPGUFN4Ib5KpqjEWYw07t0MkvfY3v1mYov
// SIG // G8chr1m1rtxEPJdQcdeh0sVV42neV8HR3jDA/czmTfsN
// SIG // v11P6Z0eGTgvvM9YBS7vDaBQNdrvCScc1bN+NR4Iuto2
// SIG // 29Nfj950iEkSoYICyzCCAjQCAQEwgfihgdCkgc0wgcox
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jv
// SIG // c29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjIyNjQtRTMzRS03ODBDMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloiMKAQEwBwYFKw4DAhoDFQC8BO6GhSDKwTN3KQTV
// SIG // tEHiiHprmKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5HM3MDAi
// SIG // GA8yMDIxMDYxNTIyMjY1NloYDzIwMjEwNjE2MjIyNjU2
// SIG // WjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDkczcwAgEA
// SIG // MAcCAQACAgLaMAcCAQACAhGJMAoCBQDkdIiwAgEAMDYG
// SIG // CisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKgCjAI
// SIG // AgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcNAQEF
// SIG // BQADgYEAZ7c1QcyXEQrCe2ejtviCiXxcVVEbEWzj73U/
// SIG // 7zsZ8mTyMJGun77UvdLAQpJ/94gqUBosp4itnd+FnmlJ
// SIG // UK3pOu5qdu4SGaoJyeivcyfl6eFhU7hIhqoWuoRw7Q6U
// SIG // jtlMTrPcdXB1qXz9hNOkdS1pHuBTlkf7Lefg/WHVpe3n
// SIG // x5wxggMNMIIDCQIBATCBkzB8MQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFt
// SIG // cCBQQ0EgMjAxMAITMwAAAUqk9zHE/yKiSQAAAAABSjAN
// SIG // BglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkDMQ0G
// SIG // CyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCDYmhVC
// SIG // 5yKtnfo2HMplDIrm3WcCU1tDCwj4uv6X4eQ2NjCB+gYL
// SIG // KoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIGwdktetudtX
// SIG // /kn7Yq/AVYiBWZBq+n4EFVQ8zUD3IlEDMIGYMIGApH4w
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAFK
// SIG // pPcxxP8iokkAAAAAAUowIgQg0CxRaCbFWe8WhLYvOYrp
// SIG // R6DdGblDoHsjbzi531MZVc8wDQYJKoZIhvcNAQELBQAE
// SIG // ggEAsc1FDDJmTs1bshaI6oUCruzrcYHp72KfBQ/2nPw4
// SIG // ISkVOr5jGJig+CqZCzf1HYySYEPdwrMPlMaMzXXtPyN9
// SIG // eMfAL5j0HwCQU8N/TIVWqqbYaBT8W/OzshD8fcK9FAp9
// SIG // GlTsFFe2TEpEG2GLO91Z7c+TK7HgfRsv2AksA9TVmDOE
// SIG // 2jt5FEZPc4Ybt6NAarOSa8Y4NyOpwodRcwBzF0sjD4f8
// SIG // c8YVdrH3/Oiwza3OqifNts30auP+QRRBmEJ2RmUiswMj
// SIG // 9MuxXQTDSmQhX3ilhQSrnWMpqxq6U1H3GQj7R3YWYTn8
// SIG // no0C3ebeXtizORTeUsbiBLsUl9otiQ5F+2fBMw==
// SIG // End signature block
