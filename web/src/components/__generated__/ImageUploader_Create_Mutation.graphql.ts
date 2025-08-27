/**
 * @generated SignedSource<<e712ef501b738978143c17608182b61e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageKind = "COVER" | "GALLERY" | "%future added value";
export type ImageUploader_Create_Mutation$variables = {
  count: number;
  gameId: string;
  kind: ImageKind;
};
export type ImageUploader_Create_Mutation$data = {
  readonly createImageUploads: ReadonlyArray<{
    readonly key: string;
    readonly url: string;
  }>;
};
export type ImageUploader_Create_Mutation = {
  response: ImageUploader_Create_Mutation$data;
  variables: ImageUploader_Create_Mutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gameId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "kind"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "count",
        "variableName": "count"
      },
      {
        "kind": "Variable",
        "name": "gameId",
        "variableName": "gameId"
      },
      {
        "kind": "Variable",
        "name": "kind",
        "variableName": "kind"
      }
    ],
    "concreteType": "PresignedPut",
    "kind": "LinkedField",
    "name": "createImageUploads",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "key",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "url",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImageUploader_Create_Mutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImageUploader_Create_Mutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "685cc53e70edf50e8cce717d90a1367f",
    "id": null,
    "metadata": {},
    "name": "ImageUploader_Create_Mutation",
    "operationKind": "mutation",
    "text": "mutation ImageUploader_Create_Mutation(\n  $gameId: String!\n  $kind: ImageKind!\n  $count: Int!\n) {\n  createImageUploads(gameId: $gameId, kind: $kind, count: $count) {\n    key\n    url\n  }\n}\n"
  }
};
})();

(node as any).hash = "3764d9558e808d4fa76a7d33b31e4938";

export default node;
