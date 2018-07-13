var App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
  balance: 0,

  init: function() {
    console.log("App initialised !!");

    // Init Web3
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://127.0.0.1:7545"
      );
      web3 = new Web3(App.web3Provider);
    }

    // Debug
    web3.version.getNetwork(function(err,res) {
      console.log('Network Id :',res)
    })

    // Init Contracts
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("FSTTokenSale.json", function(fstTokenSale) {
      // Instantiate tokensale contract
      App.contracts.FSTTokenSale = TruffleContract(fstTokenSale);
      
      // Connect provider to interact with contract
      App.contracts.FSTTokenSale.setProvider(App.web3Provider);

      // Get Tokensale contract
      App.contracts.FSTTokenSale.deployed().then(function(tokensale) {
        console.log("Token Sale Address :: " + tokensale.address);
      });
    })
    .done(function() {
      $.getJSON("FSTToken.json", function(fstToken) {
        App.contracts.FSTToken = TruffleContract(fstToken);
        App.contracts.FSTToken.setProvider(App.web3Provider);
        
        // Get Token contract
        App.contracts.FSTToken.deployed().then(function(token) {
          console.log("Token Address :: " + token.address);
        });

        // Listen For events
        App.listenForEvents()

        // Render UI
        return App.render();
      });
    })
  },

  listenForEvents: function() {
    // Listen for events emitted from contrcat
    App.contracts.FSTTokenSale.deployed().then(function(instance) {
      // Watch
      instance.TokenPurchase({}, {
        fromBlock: 0,
        toBloack: 'latest',
      }).watch(function(error, event) {
        // Reload UI
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    // Show Loader and hide content
    $('#loader').show();    
    $('#content').hide();

    // Get Account connceted to node
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load TokenSale Contract
    var fstTokenSale;
    App.contracts.FSTTokenSale.deployed().then(function(instance) {
      fstTokenSale = instance;

      // Get Token Price
      return fstTokenSale.tokenPrice();
    })
    .then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $(".token-price").html(web3.fromWei(App.tokenPrice.toNumber(), 'ether'));

      // Get Token Sold
      return fstTokenSale.tokenSold();
    })
    .then(function(tokenSold) {
      App.tokensSold = tokenSold.toNumber();
      $(".tokens-sold").html(App.tokensSold);

      // Token Avilable is constant
      $(".tokens-available").html(App.tokensAvailable);

      // Progress bar
      var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load Token Contract
      var fstToken;
      App.contracts.FSTToken.deployed().then(function(instance) {
        fstToken = instance;

        // Get Account balance
        return fstToken.balanceOf(App.account);
      })
      .then(function(balance) {
        App.balance = balance.toNumber();
        $(".fst-balance").html(App.balance);

        // Hide Loader Once all the fetch is done
        App.loading = false;
        $('#content').show();
        $('#loader').hide();
      })
    })
  },

  buyTokens: function() {
    console.log('buyTokens');
    // Show Loader and hide content
    $('#loader').show();    
    $('#content').hide();
    
    var numberOfTokens = $("#numberOfTokens").val()
    App.contracts.FSTTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000
      })
    })
    .then(function(result) {
      console.log("Brought Tokens !!");
    })
  }
};

$(window).on("load", function() {
  App.init();
});
