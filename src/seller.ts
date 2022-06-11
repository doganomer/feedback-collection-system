/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Seller {
    @Property()
    public LegalEntityID: string;

    @Property()
    public Name: string;

    @Property()
    public Url: string;

    @Property()
    public RegisteredDate: Date;

    @Property()
    public RegisteredBy: string;

    @Property()
    public LastReputationScore: number;

    @Property()
    public NoOfTransactions: number;
}
