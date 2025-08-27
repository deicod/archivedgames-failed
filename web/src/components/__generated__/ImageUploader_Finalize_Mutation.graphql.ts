/**
 * @generated SignedSource<<e5da658bc63e9cee1650f2a1fb7ff402>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageKind = "COVER" | "GALLERY" | "%future added value";
export type UploadedImageInput = {
  height: number;
  key: string;
  width: number;
};
export type ImageUploader_Finalize_Mutation$variables = {
  gameId: string;
  items: ReadonlyArray<UploadedImageInput>;
  kind: ImageKind;
};
export type ImageUploader_Finalize_Mutation$data = {
  readonly finalizeImageUploads: ReadonlyArray<{
    readonly id: string;
    readonly s3Key: string;
  }>;
};
export type ImageUploader_Finalize_Mutation = {
  response: ImageUploader_Finalize_Mutation$data;
  variables: ImageUploader_Finalize_Mutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gameId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "items"
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
        "name": "gameId",
        "variableName": "gameId"
      },
      {
        "kind": "Variable",
        "name": "items",
        "variableName": "items"
      },
      {
        "kind": "Variable",
        "name": "kind",
        "variableName": "kind"
      }
    ],
    "concreteType": "Image",
    "kind": "LinkedField",
    "name": "finalizeImageUploads",
    "plural": true,
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
        "name": "s3Key",
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
    "name": "ImageUploader_Finalize_Mutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImageUploader_Finalize_Mutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "82a22d31cbcc1d7504d6591aab8e3c35",
    "id": null,
    "metadata": {},
    "name": "ImageUploader_Finalize_Mutation",
    "operationKind": "mutation",
    "text": "mutation ImageUploader_Finalize_Mutation(\n  $gameId: String!\n  $kind: ImageKind!\n  $items: [UploadedImageInput!]!\n) {\n  finalizeImageUploads(gameId: $gameId, kind: $kind, items: $items) {\n    id\n    s3Key\n  }\n}\n"
  }
};
})();

(node as any).hash = "385f3d2caf9c8032eec165c15a99a20f";

export default node;
