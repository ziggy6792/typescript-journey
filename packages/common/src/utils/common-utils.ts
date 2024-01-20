/* eslint-disable no-restricted-imports */

import { commonConfig } from 'src';

export enum BucketName {
  'FILE_UPLOADS' = 'file-uploads',
  'IMAGES' = 'images',
}

const getConstructName = (constuctName: string, stage: string): string => {
  const contItems = [commonConfig.PROJECT_NAME, stage, constuctName].filter((v) => v != null);
  return contItems.join('-');
};

export const getS3BucketName = (bucketName: BucketName, stage: string): string => getConstructName(bucketName, stage);

export enum LambdaFunctionName {
  'USER_CONFIRMED' = 'user-confirmed',
}

export const getLambdaFunctionName = (lambdaName: LambdaFunctionName, stage: string): string => getConstructName(lambdaName, stage);

// export const getSsmParam = <T = any>(paramPath: SsmParam, stage: string): SSMParamUtil<T> => new SSMParamUtil<T>(paramPath, stage);
