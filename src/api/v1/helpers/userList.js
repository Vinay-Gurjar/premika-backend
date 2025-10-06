import geohash from "ngeohash"
import nodeDynamoDb from '@techveda/node-dynamodb';
export const { initDynamoDB} = nodeDynamoDb;


export const getUsersInRadius = async (userLat, userLon, minRadius = 0, maxRadius = 10) => {
    try {
        const precision = getPrecisionForRadius(maxRadius);
        const centerGeoHash = geohash.encode(userLat, userLon);
        const centerPrefix = centerGeoHash.substring(0, precision);
       
        const neighbors = geohash.neighbors(centerPrefix);
        const searchPrefixes = [centerPrefix, ...neighbors];
        
        return {searchPrefixes, precision}
        
    } catch (error) {
        console.error('Error in getUsersInRadius:', error);
        throw error;
    }
}


const getPrecisionForRadius = (radiusKm) => {
        const precisionMap = {
        1: 7,  
        5: 6,  
        10: 5, 
        20: 4,  
        50: 3,
        100: 2,
        500: 2,
        1000: 1,
        3000: 1
    };
    const thresholds = Object.keys(precisionMap)
        .map(Number)
        .sort((a, b) => b - a);
    
    for (const threshold of thresholds) {
        if (radiusKm >= threshold) {
            return precisionMap[threshold];
        }
    }
    return 7; // Default highest precision
}
