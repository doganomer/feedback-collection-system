/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';
import { Seller } from './seller';

@Object()
export class Feedback {
    @Property()
    public ID: string;

    @Property()
    public SellerId: string;

    @Property()
    public Score: number;

    @Property()
    public Comment: string;

    @Property()
    public FeedbackTokenId: string;
}
