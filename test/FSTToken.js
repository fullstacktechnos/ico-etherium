const FSTToken = artifacts.require('FSTToken');

contract("FSTToken", accounts => {
    it('sets the total supply upon deployement ', async () => {
        let instance = await FSTToken.deployed();
        let totalSupply = await instance.totalSupply();
        assert.equal(totalSupply, 1000000, 'sets the total supply to 10,00,000');
    })
});