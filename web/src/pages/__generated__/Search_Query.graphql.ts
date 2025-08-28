/**
 * @generated SignedSource<<4248011a84e484ce111f9c7b6e6c1a39>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GamePlatform = "AMIGA" | "C64" | "DOS" | "%future added value";
export type Search_Query$variables = {
  after?: any | null | undefined;
  first?: number | null | undefined;
  format?: string | null | undefined;
  platform?: GamePlatform | null | undefined;
  q: string;
  yearFrom?: number | null | undefined;
  yearTo?: number | null | undefined;
};
export type Search_Query$data = {
  readonly searchGames: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly platform: GamePlatform;
        readonly slug: string;
        readonly title: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly pageInfo: {
      readonly endCursor: any | null | undefined;
      readonly hasNextPage: boolean;
    };
    readonly totalCount: number;
  };
};
export type Search_Query = {
  response: Search_Query$data;
  variables: Search_Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "format"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "platform"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "q"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "yearFrom"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "yearTo"
},
v7 = [
  {
    "kind": "ClientExtension",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "after",
            "variableName": "after"
          },
          {
            "kind": "Variable",
            "name": "first",
            "variableName": "first"
          },
          {
            "kind": "Variable",
            "name": "format",
            "variableName": "format"
          },
          {
            "kind": "Variable",
            "name": "platform",
            "variableName": "platform"
          },
          {
            "kind": "Variable",
            "name": "q",
            "variableName": "q"
          },
          {
            "kind": "Variable",
            "name": "yearFrom",
            "variableName": "yearFrom"
          },
          {
            "kind": "Variable",
            "name": "yearTo",
            "variableName": "yearTo"
          }
        ],
        "concreteType": "GameConnection",
        "kind": "LinkedField",
        "name": "searchGames",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "GameEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Game",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "slug",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "title",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "platform",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalCount",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "Search_Query",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v3/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "Search_Query",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "84175312e30bee1537dd244f99f125a6",
    "id": null,
    "metadata": {},
    "name": "Search_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "8dd33fb27c1e79821b16ca6b2d1241f9";

export default node;
