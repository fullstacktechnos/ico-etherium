const FSTToken = artifacts.require('FSTToken');

contract("FSTToken", accounts => {
    let instance;
    const admin = accounts[0];

    beforeEach(async() => {
        instance = await FSTToken.deployed();
    });

    describe('Initialization', () => {
      it('sets the total token supply upon deployement ', async () => {  
        let totalSupply = await instance.totalSupply.call();
        assert.equal(totalSupply, 1000000, 'sets the total token supply to 10,00,000');
      });

      it('sets the initial admin balance upon deployement ', async () => {  
        let adminBalance = await instance.balanceOf.call(admin);
        assert.equal(adminBalance, 1000000, 'sets the initial admin balance to 10,00,000');
      });
      
      it('initializes contract name', async () => {
        let name = await instance.name()
        assert.equal(name, 'FSTToken', 'Correct contract name as FSTToken');
      });

      it('initializes contract symbol', async () => {
        let symbol = await instance.symbol()
        assert.equal(symbol, 'FST', 'Correct contract symbol as FST');
      });
    });

    describe('Transfer', () => {
      it('should not transfer token if sender does not have required balance', async () => {
        try {
          // Does not create a transaction
          await instance.transfer.call(accounts[1],'2222222222222222');
          assert(false);
        } catch(err) {
          assert(err.message.indexOf('revert') >= 0, 'err msg must contain the word revert');
        }
      })

      it('should transfer token successfully', async () => {
        // Trigger a transaction 
        const receipt = await instance.transfer(accounts[1], 100000, { from: accounts[0]});
        const { event, args } = receipt.logs[0];
        const { _from, _to, _value } = args;
        
        assert.equal(receipt.logs.length, 1, 'triggers a event');
        assert.equal(event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(_from, accounts[0], 'logs the account from which tokens are transferred');
        assert.equal(_to, accounts[1], 'logs the account to which tokens are transferred');
        assert.equal(_value, 100000, 'logs the token transfer amount');
        
        const recipientBalance = await instance.balanceOf.call(accounts[1]);
        assert.equal(recipientBalance.toNumber(), 100000, 'token should be successfully added to recipientaccount');

        const senderBalance = await instance.balanceOf.call(accounts[0]);
        assert.equal(senderBalance.toNumber(), 900000, 'token should be successfully removed from adminaccount');
      })
    })
});