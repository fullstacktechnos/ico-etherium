var HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config()

/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "http://127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    rinkeby: {
      //host: "localhost",
      //port: 8545,
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, 
          "https://rinkeby.infura.io/" + process.env.INFURA_APIKEY
        );
      },
      network_id: 4,
      gas: 4700000
    }
  }
};
