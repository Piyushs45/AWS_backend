import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const PRODUCTS_TABLE = 'ProductsTable';
const STOCK_TABLE = 'StockTable';

export const handler = async (event: any) => {
  try {
    const { productId } = event.pathParameters;

    // Get product by ID
    const productResult = await client.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id: productId },
      })
    );

    if (!productResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    // Get stock by product_id
    const stockResult = await client.send(
      new GetCommand({
        TableName: STOCK_TABLE,
        Key: { product_id: productId },
      })
    );

    const count = stockResult.Item?.count ?? 0;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ ...productResult.Item, count }),
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
