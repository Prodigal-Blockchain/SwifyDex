// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import "./pool/ISwifyDexPoolImmutables.sol";
import "./pool/ISwifyDexPoolState.sol";
import "./pool/ISwifyDexPoolDerivedState.sol";
import "./pool/ISwifyDexPoolActions.sol";
import "./pool/ISwifyDexPoolOwnerActions.sol";
import "./pool/ISwifyDexPoolEvents.sol";

/// @title The interface for a SwifyDex  Pool
/// @notice A SwifyDex pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface ISwifyDexPool is
    ISwifyDexPoolImmutables,
    ISwifyDexPoolState,
    ISwifyDexPoolDerivedState,
    ISwifyDexPoolActions,
    ISwifyDexPoolOwnerActions,
    ISwifyDexPoolEvents
{}
