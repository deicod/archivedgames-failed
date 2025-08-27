/**
 * @generated SignedSource<<9b511f3db3bbbce5ca44e91dd9889f29>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SupportButton_PublicConfig_Query$variables = Record<PropertyKey, never>;
export type SupportButton_PublicConfig_Query$data = {
  readonly publicSiteConfig: any;
};
export type SupportButton_PublicConfig_Query = {
  response: SupportButton_PublicConfig_Query$data;
  variables: SupportButton_PublicConfig_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "ClientExtension",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "publicSiteConfig",
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SupportButton_PublicConfig_Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SupportButton_PublicConfig_Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "31d1fa1706f0c1297f503fcf6ffe791d",
    "id": null,
    "metadata": {},
    "name": "SupportButton_PublicConfig_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "75df2cde8568232d22fe0160c969e7ac";

export default node;
