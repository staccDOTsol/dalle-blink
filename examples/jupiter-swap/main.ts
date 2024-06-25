const { ChartConfiguration } = require( "chart.js" );
const { ChartJSNodeCanvas } = require( "chartjs-node-canvas" );

// Chart generation setup
const width = 800;
const height = 600;

const imgur =require( 'imgur' ).default;
const Imgur = new imgur({
  clientId:'06f787d29bb77bf',
  clientSecret:'f2966431bf8f496742a06d6ed36431c31a760f0e'
})

// Function to upload image to Imgur
const uploadImageToImgur = async (image: string) => {
  try {
    const response = await Imgur.upload({
      image,

      type: "base64"
    });
    console.log(response.data)
    return response.data.link;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
};
const fs = require('fs')
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
const generateCandlestickChart = async (mint: any, candlestickData: any) => {
  const labels = candlestickData.map((item: any, index: number) => index + 1);
  const data = candlestickData.map((item: any) => ({
    x: item.timestamp, // Use the sequential label
    y: item.close,
  }));
  console.log(data)

  const configuration: any = {

    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Candlestick Data',
        data: data,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }],
    },
    options: {
      scales: {
      
      },
    },
  };
// @ts-ignore
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  const path = new Date().getTime().toString()+'.png'
  fs.writeFileSync(path, image)
  const img = await uploadImageToImgur(image.toString('base64'))
  return {imagePath: path, imgurLink: img}
};
// Function to fetch candlestick data for a given mint
const getCandlestickData = async (mint: string) => {
  const response = await fetch(`https://frontend-api.pump.fun/candlesticks/${mint}?offset=0&limit=1000&timeframe=1`);
  const rawData = await response.json();
  const formattedData = rawData.map((item: any) => ({
    mint: item.mint,
    timestamp: item.timestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
    slot: item.slot,
    is5Min: item.is_5_min,
    is1Min: item.is_1_min,
  }));
  return formattedData;
};

async function main(){

const candlestickData = await getCandlestickData("5Mw5Jo9EFHyP7vKX63YBpJAShu6ikjZc8Eynuczapump");

const i2 = await generateCandlestickChart("5Mw5Jo9EFHyP7vKX63YBpJAShu6ikjZc8Eynuczapump", candlestickData) as any
console.log(i2)
}
main()