//SPDX-License-Identifier: UNLICENSED

pragma solidity >0.8.4;

contract UUPSProxy {
    address implementation;

    fallback() external payable {
        // delegate here
    }
}

abstract contract UUPSProxiable {
    address implementation;
    address admin;

    function upgrade(address newImplementation) external {
        require(msg.sender == admin);
        implementation = newImplementation;
    }
}
