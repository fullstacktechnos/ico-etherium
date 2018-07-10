const FSTTokenSale = artifacts.require("FSTTokenSale");
const FSTToken = artifacts.require("FSTToken");

contract("FSTTokenSale", accounts => {
  const admin = accounts[0];
  const buyer = accounts[1];
  const tokenPrice = 1000000000000000; //in wei (0.001 ether)
  const numberOfTokens = 10;
  const totalSupply = 1000000;
  const tokenSupply = 750000; 

  beforeEach(async () => {
    this.token = await FSTToken.new(totalSupply);
    this.tokensale = await FSTTokenSale.new(this.token.address, tokenPrice);
    await this.token.transfer(this.tokensale.address, tokenSupply, { from: admin });
  });

  describe("Initialization", () => {
    it("initializes contract", async () => {
      let address = await this.tokensale.address;
      assert.notEqual(address, 0x0, "proper contract address");

      let tokenAddress = await this.tokensale.token();
      assert.notEqual(tokenAddress, 0x0, "proper token contract address");

      let price = await this.tokensale.tokenPrice();
      assert.equal(price, tokenPrice, "proper token price");
    });
  });

  describe("Buying Tokens", () => {
    it('should not transfer tokens if buyer is underpaying or overpaying', async () => {
      try {
        await this.tokensale.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        assert(false);
      } catch(err) {
        assert(err.message.indexOf('revert') >= 0, 'msg.value should be numberOfTokens * tokenPrice');
      }
    })

    it("should increase the token sold amount upon successful transfer", async () => {
      const receipt = await this.tokensale.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice
      });
      
      const { event, args } = receipt.logs[0];
      const { _buyer, _amount, _value } = args;
      assert.equal(receipt.logs.length, 1, "triggers a event");
      assert.equal(event, "TokenPurchase", 'should be the "TokenPurchase" event');
      assert.equal(_buyer, buyer, "logs the account that purchased the tokens");
      assert.equal(_amount, numberOfTokens, "logs the number of tokens purchased");
      assert.equal(_value, numberOfTokens * tokenPrice, "logs the value in wei for tokens purchased");
      
      const numberOfTokensSold = await this.tokensale.tokenSold();
      assert.equal(numberOfTokensSold.toNumber(), numberOfTokens, "number of token sold should increase");
    });
    
    it("should increase the raised amount upon successful transfer", async () => {
      const raisedAmountBeforeTransfer = await this.tokensale.weiRaised();
      
      await this.tokensale.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice
      });

      const raisedAmountAfterTransfer = await this.tokensale.weiRaised();
      assert.equal(
        raisedAmountAfterTransfer.toNumber(),
        raisedAmountBeforeTransfer.toNumber() + numberOfTokens * tokenPrice,
        "raised amount should increase"
      );
    });

    it("should transfer tokens to buyer upon successful transfer", async () => {
      const buyerBalanceBeforeTransfer = await this.token.balanceOf(buyer);
      
      await this.tokensale.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice
      });

      const buyerBalanceAfterTransfer = await this.token.balanceOf(buyer);
      assert.equal(
        buyerBalanceAfterTransfer.toNumber(),
        buyerBalanceBeforeTransfer.toNumber() + numberOfTokens,
        "buyer token value should increase"
      );
    });

    it("should decrease the token aviliability of tokensale contract upon successful transfer", async () => {
      const tokensaleBalanceBeforeTransfer = await this.token.balanceOf(this.tokensale.address);
      
      await this.tokensale.buyTokens(numberOfTokens, {
        from: buyer,
        value: numberOfTokens * tokenPrice
      });
      
      const tokensaleBalanceAfterTransfer = await this.token.balanceOf(this.tokensale.address);
      assert.equal(
        tokensaleBalanceAfterTransfer.toNumber(),
        tokensaleBalanceBeforeTransfer.toNumber() - numberOfTokens,
        "tokens present in token sale should decrease"
      );
    });
  });

  describe("Ends Token Sale", () => {
    it('should not end sale if user is not admin', async () => {
      try {
        await this.tokensale.endSale({ from: buyer });
        assert(false);
      } catch(err) {
        assert(err.message.indexOf('revert') >= 0, 'can not end sale if not admin');
      }
    });
    
    it('should end sale as admin', async () => {
      await this.tokensale.endSale({ from: admin });
    });

    it('should send remaining tokens back to admin', async() => {
      let beforeAdminBalance = await this.token.balanceOf(admin);
      let remainingBalanceInContract = await this.token.balanceOf(this.tokensale.address);
      
      await this.tokensale.endSale({ from: admin });

      let afterAdminBalance = await this.token.balanceOf(admin);
      assert.equal(
        afterAdminBalance.toNumber(),
        beforeAdminBalance.toNumber() + remainingBalanceInContract.toNumber(),
        'admin should get back remaining tokens once sale ends')
    })
  })
});
