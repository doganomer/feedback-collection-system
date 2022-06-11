/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';
import { Marketplace } from './marketplace';
import { Seller } from './seller';

@Object()
export class Feedback {
    @Property()
    public ID: string;

    @Property()
    public SellerId: string;

    @Property()
    public MarketplaceId: string;

    @Property()
    public FeedbackDate: Date;

    @Property()
    public Score: number;

    @Property()
    public Comment: string;

    @Property()
    public FeedbackTokenId: string;
}
