// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import "../libraries/TickMath.sol";

import "../interfaces/callback/ISwifyDexSwapCallback.sol";

import "../interfaces/ISwifyDexPool.sol";

contract TestSwifyDexReentrantCallee is ISwifyDexSwapCallback {
    string private constant expectedReason = "LOK";

    function swapToReenter(address pool) external {
        ISwifyDexPool(pool).swap(
            address(0),
            false,
            1,
            TickMath.MAX_SQRT_RATIO - 1,
            new bytes(0)
        );
    }

    function SwifyDexSwapCallback(
        int256,
        int256,
        bytes calldata
    ) external override {
        // try to reenter swap
        try
            ISwifyDexPool(msg.sender).swap(
                address(0),
                false,
                1,
                0,
                new bytes(0)
            )
        {} catch Error(string memory reason) {
            require(
                keccak256(abi.encode(reason)) ==
                    keccak256(abi.encode(expectedReason))
            );
        }

        // try to reenter mint
        try
            ISwifyDexPool(msg.sender).mint(address(0), 0, 0, 0, new bytes(0))
        {} catch Error(string memory reason) {
            require(
                keccak256(abi.encode(reason)) ==
                    keccak256(abi.encode(expectedReason))
            );
        }

        // try to reenter collect
        try
            ISwifyDexPool(msg.sender).collect(address(0), 0, 0, 0, 0)
        {} catch Error(string memory reason) {
            require(
                keccak256(abi.encode(reason)) ==
                    keccak256(abi.encode(expectedReason))
            );
        }

        // try to reenter burn
        try ISwifyDexPool(msg.sender).burn(0, 0, 0) {} catch Error(
            string memory reason
        ) {
            require(
                keccak256(abi.encode(reason)) ==
                    keccak256(abi.encode(expectedReason))
            );
        }

        // try to reenter flash
        try
            ISwifyDexPool(msg.sender).flash(address(0), 0, 0, new bytes(0))
        {} catch Error(string memory reason) {
            require(
                keccak256(abi.encode(reason)) ==
                    keccak256(abi.encode(expectedReason))
            );
        }

        // try to reenter collectProtocol
        try
            ISwifyDexPool(msg.sender).collectProtocol(address(0), 0, 0)
        {} catch Error(string memory reason) {
            require(
                keccak256(abi.encode(reason)) ==
                    keccak256(abi.encode(expectedReason))
            );
        }

        require(false, "Unable to reenter");
    }
}
