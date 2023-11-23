import safeAwait from 'safe-await';

export default defineEventHandler(async (event) => {
  console.log('Here');
  const [error, data] = await safeAwait(ImageSchema.find({}));
  console.log(error);
  console.log(data);
  return data;
});
