const FSTToken = artifacts.require('FSTToken');

contract("FSTToken", accounts => {
    const admin = accounts[0];

    const totalSupply = 1000000;
    beforeEach(async() => {
        this.token = await FSTToken.new(totalSupply);
    });

    describe('Initialization', () => {
      it('should have a proper contract address', async () => {
        let address = await this.token.address;
        assert.notEqual(address, 0x0, 'proper contract address');
      });

      it('sets the total token supply upon deployement ', async () => {  
        let totalSupplyAmt = await this.token.totalSupply.call();
        assert.equal(totalSupplyAmt, totalSupply, 'sets the total token supply to 10,00,000');
      });

      it('sets the initial admin balance upon deployement ', async () => {  
        let adminBalance = await this.token.balanceOf.call(admin);
        assert.equal(adminBalance, totalSupply, 'sets the initial admin balance to 10,00,000');
      });
      
      it('initializes contract name', async () => {
        let name = await this.token.name()
        assert.equal(name, 'FSTToken', 'Correct contract name as FSTToken');
      });

      it('initializes contract symbol', async () => {
        let symbol = await this.token.symbol()
        assert.equal(symbol, 'FST', 'Correct contract symbol as FST');
      });
    });

    describe('Direct Transfer', () => {
      it('should not transfer token if sender does not have required balance', async () => {
        try {
          // Does not create a transaction
          await this.token.transfer.call(accounts[1],2222222222222222);
          assert(false);
        } catch(err) {
          assert(err.message.indexOf('revert') >= 0, 'err msg must contain the word revert');
        }
      })

      it('should transfer token successfully', async () => {
        // Trigger a transaction 
        const receipt = await this.token.transfer(accounts[1], 100000, { from: admin });
        const { event, args } = receipt.logs[0];
        const { _from, _to, _value } = args;
        
        assert.equal(receipt.logs.length, 1, 'triggers a event');
        assert.equal(event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(_from, accounts[0], 'logs the account from which tokens are transferred');
        assert.equal(_to, accounts[1], 'logs the account to which tokens are transferred');
        assert.equal(_value, 100000, 'logs the token transfer amount');
        
        const recipientBalance = await this.token.balanceOf.call(accounts[1]);
        assert.equal(recipientBalance.toNumber(), 100000, 'token should be successfully added to recipientaccount');

        const senderBalance = await this.token.balanceOf.call(accounts[0]);
        assert.equal(senderBalance.toNumber(), 900000, 'token should be successfully removed from adminaccount');
      })
    })

    describe('Delegated Transfer', () => {
      it('should approves tokens for delegated transfer', async () => {
        const response = await this.token.approve.call(accounts[1], 100);
        assert.equal(response, true);

        const receipt = await this.token.approve(accounts[1], 100, { from : admin });
        const { event, args } = receipt.logs[0];
        const { _owner, _spender, _value } = args;
        
        assert.equal(receipt.logs.length, 1, 'triggers a event');
        assert.equal(event, 'Approval', 'should be the "Approval" event');
        assert.equal(_owner, admin, 'logs the account from which tokens are transferred');
        assert.equal(_spender, accounts[1], 'logs the account to which tokens are transferred');
        assert.equal(_value, 100, 'logs the token transfer amount');

        const allowance =  await this.token.allowance(admin, accounts[1]);
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
      });
      
      it('should not perform delegated transfer', async () => {
        let spendingAccount = accounts[1];

        let fromAccount = accounts[2];
        let toAccount = accounts[3];

        await this.token.transfer(fromAccount, 50000, { from: admin });
        await this.token.approve(spendingAccount, 100, { from : fromAccount });

        try {
          await this.token.transferFrom(fromAccount, toAccount, 90000, { from : spendingAccount });
          assert(false);
        } catch(err) {
          assert(err.message.indexOf('revert') >= 0, 'can not transfer token more than the balance');
        }

        try {
          await this.token.transferFrom(fromAccount, toAccount, 500, { from : spendingAccount });
          assert(false);
        } catch(err) {
          assert(err.message.indexOf('revert') >= 0, 'can not transfer token more than approved');
        }
      })

      it('should perform delegated transfer', async () => {
        let fromAccount = accounts[4];

        let toAccount = accounts[5];
        let spendingAccount = accounts[6];

        await this.token.transfer(fromAccount, 50000, { from: admin });
        await this.token.approve(spendingAccount, 100, { from : fromAccount });
        const receipt = await this.token.transferFrom(fromAccount, toAccount, 40, { from : spendingAccount });
        const { event, args } = receipt.logs[0];
        const { _from, _to, _value } = args;
        
        assert.equal(receipt.logs.length, 1, 'triggers a event');
        assert.equal(event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(_from, fromAccount, 'logs the account from which tokens are transferred');
        assert.equal(_to, toAccount, 'logs the account to which tokens are transferred');
        assert.equal(_value, 40, 'logs the token transfer amount');
        
        const fromBalance = await this.token.balanceOf.call(fromAccount);
        assert.equal(fromBalance.toNumber(), 49960, 'token should be successfully removed from sender'); 

        const toBalance = await this.token.balanceOf.call(toAccount);
        assert.equal(toBalance.toNumber(), 40, 'token should be added successfully to recipient'); 

        const toAllowance = await this.token.allowance(fromAccount, spendingAccount);
        assert.equal(toAllowance.toNumber(), 60, 'token allowance should be deducted'); 
      })

    })
});