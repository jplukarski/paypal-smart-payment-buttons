/* @flow */
/** @jsx node */

import { node, type ChildType, type ChildrenType } from '@krakenjs/jsx-pragmatic';

import { CLASS } from './constants';

export function Text({ optional, className = [] } : {| optional? : boolean, className? : $ReadOnlyArray<string> |}, children : ChildrenType) : ChildType {
    return (
        <span class={ [ CLASS.TEXT, ...className  ].join(' ') } optional={ optional }>{ children }</span>
    );
}
