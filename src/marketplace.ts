/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Marketplace {
    @Property()
    public ID: string;

    @Property()
    public Name: string;

    @Property()
    public Url: string;
}
