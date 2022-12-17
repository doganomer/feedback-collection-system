/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { Seller } from './seller';
import { Feedback } from './feedback';
import common from 'mocha/lib/interfaces/common';

@Info({title: 'FeedbackCollection', description: 'Smart contract for Feedback Collection System'})
export class FeedbackCollectionContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const sellers: Seller[] = [
            {
                LegalEntityID: 'ID_SELLER1_ID',
                Name: 'Seller 1',
                Url: 'http://www.seller1.com',
                RegisteredBy: 'SYSTEM',
                LastReputationScore:0,
                NoOfTransactions:0,    
            },
            {
                LegalEntityID: 'ID_SELLER2_ID',
                Name: 'Seller 2',
                Url: 'http://www.seller2.com',
                RegisteredBy: 'SYSTEM',
                LastReputationScore:0,
                NoOfTransactions:0,   
            },
        ];

        for (const seller of sellers) {
            const compositeKey = await ctx.stub.createCompositeKey('Seller', [seller.LegalEntityID, seller.Name])
            await ctx.stub.putState(compositeKey, Buffer.from(stringify(sortKeysRecursive(seller))));
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);

            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // Createseller creates a new seller to the world state with given details.
    @Transaction()
    public async CreateSeller(ctx: Context, LegalEntityID: string, Name: string, Url: string, RegisteredBy: string): Promise<void> {
        const exists = await this.SellerExists(ctx, LegalEntityID);
        if (exists) {
            throw new Error(`The seller ${LegalEntityID} already exists`);
        }

        const seller: Seller = {
            LegalEntityID: LegalEntityID,
            Name: Name,
            Url: Url,
            RegisteredBy: RegisteredBy,
            LastReputationScore: 0,
            NoOfTransactions: 0
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'

        const compositeKey = await ctx.stub.createCompositeKey('Seller', [seller.LegalEntityID, seller.Name])

        await ctx.stub.putState(compositeKey, Buffer.from(stringify(sortKeysRecursive(seller))));
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async SellerExists(ctx: Context, LegalEntityID: string): Promise<boolean> {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('Seller', [LegalEntityID])
        let result = await iterator.next();

        return !result.done;
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadSeller(ctx: Context, LegalEntityID: string): Promise<Seller> {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('Seller', [LegalEntityID])
        let result = await iterator.next();
        let record:Seller;
        if (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                // console.log(err);
                // record = strValue;
                throw new Error(`Error parsing seller record`);
            }
            //return JSON.stringify(record);
            return record;
        }
        else {
            throw new Error(`The seller with ID ${LegalEntityID} does not exist`);
        }
    }

    // GetAllSellers returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllSellers(ctx: Context): Promise<Array<Seller>> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByPartialCompositeKey('Seller',[])
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
    // return JSON.stringify(allResults);
        return allResults;
    }

    // GetAllSellers returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllMarketplaces(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByPartialCompositeKey('Marketplace',[])
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // AddFeedback creates a new feedback record to the world state with given details.
    @Transaction()
    public async AddFeedback(ctx: Context, ID: string, SellerId: string, Score: number, Comment: string, FeedbackTokenId: string): Promise<void> {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('Feedback', [,,FeedbackTokenId]);
        let result = await iterator.next();
        if (!result.done)
        {
            throw new Error(`The provided feedback token was used before`);
        }

        const sellerIterator = await ctx.stub.getStateByPartialCompositeKey('Seller', [SellerId])
        let sellerResult = await sellerIterator.next();
        let sellerRecord:Seller;
        if (!sellerResult.done)
        {
            const strValue = Buffer.from(sellerResult.value.value.toString()).toString('utf8');
            try {
                sellerRecord = JSON.parse(strValue);
            } catch (err) {
                // console.log(err);
                // sellerRecord = strValue;
                throw new Error(`Error parsing seller record`);
            }
            
            let totalScore = sellerRecord.LastReputationScore*sellerRecord.NoOfTransactions+Score;
            let newScore = totalScore/(sellerRecord.NoOfTransactions+1);

            sellerRecord.LastReputationScore= newScore;
            sellerRecord.NoOfTransactions +=1;

            const compositeKey = await ctx.stub.createCompositeKey('Seller', [sellerRecord.LegalEntityID, sellerRecord.Name])
            await ctx.stub.putState(compositeKey, Buffer.from(stringify(sortKeysRecursive(sellerRecord))));


        }
        else
        {
            throw new Error(`The seller ${SellerId} does not exist`);
        }
   
        const feedback: Feedback = {
            ID: ID,
            Comment: Comment,
            FeedbackTokenId: FeedbackTokenId,
            Score: Score,
            SellerId: SellerId
        };
        
        const compositeKey = await ctx.stub.createCompositeKey('Feedback', [feedback.ID, feedback.SellerId, feedback.FeedbackTokenId])
        await ctx.stub.putState(compositeKey, Buffer.from(stringify(sortKeysRecursive(feedback))));
    }

    // GetAllSellers returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllFeedbacks(ctx: Context): Promise<Array<Feedback>> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByPartialCompositeKey('Feedback',[])
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
    // return JSON.stringify(allResults);
        return allResults;
    }

}
