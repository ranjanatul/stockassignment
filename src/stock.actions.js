import { FNCTN_KEY, FNCTN_VAL, RES_KEY } from './stock.const';

// arrange the response of fetch for x-axis, y-axis
export const arrangeResponse = (data, type) => {
  const xAxis = [];
  const yAxislow = [];
  const yAxishigh = [];
  const Months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  Object.keys(data).forEach((key) => {
    // fetch date, time and create x-axis as per the selected data.
    let date;
    let time;
    const x = new Date(key);
    if (type === FNCTN_VAL.TIME_SERIES_INTRADAY) {
      date = `${x.getDate()}-${Months[x.getMonth()]}`;
      time = `${x.getHours()}:00`;
    }
    if (type === FNCTN_VAL.TIME_SERIES_DAILY_ADJUSTED) {
      date = `${x.getDate()}-${Months[x.getMonth()]}`;
      time = `${x.getHours()}:00`;
    }
    if (type === FNCTN_VAL.TIME_SERIES_WEEKLY_ADJUSTED) {
      date = `${Months[x.getMonth()]}-${x.getFullYear()}`;
      time = '';
    }
    if (type === FNCTN_VAL.TIME_SERIES_MONTHLY_ADJUSTED) {
      date = `${Months[x.getMonth()]}-${x.getFullYear()}`;
      time = '';
    }
    xAxis.push(`${date} ${time}`);
    yAxislow.push(data[key]['3. low']);
    yAxishigh.push(data[key]['2. high']);
  });
  return { xAxis, yAxislow, yAxishigh };
};

// fetch the response from the api
export const getStock = async ({ functionName, stockName, timeInterval }) => {
  // check for the session data. if available then send the same. no api call
  const sessionData = JSON.parse(sessionStorage.getItem('Stock'));
  if (sessionData) {
    const {
      functionName: f,
      stockName: s,
      timeInterval: t,
      stockData,
    } = sessionData;
    if (f === functionName && s === stockName && t === timeInterval) {
      return { ...stockData };
    }
  }

  // if session data doesn't match the new request then call the api.
  return fetch(
    `https://www.alphavantage.co/query?function=${functionName}&symbol=${stockName}&interval=${timeInterval}min&apikey=${process.env.REACT_APP_API}`
  )
    .then((res) => res.json())
    .then((res) => {
      // error response coming with status 200.
      if (res[RES_KEY.NOTE]) throw res;
      if (res[RES_KEY.ERROR_MSG]) throw res;

      // if no error found.
      let data = '';
      let type = '';
      const resKeys = (Object.keys(res) && Object.keys(res)[1]) || '';

      // check the type of response and arrange the labels accordingly.
      if (resKeys.indexOf(FNCTN_VAL.TIME_SERIES_INTRADAY) > -1) {
        type = FNCTN_VAL.TIME_SERIES_INTRADAY;
        data = res[FNCTN_VAL.TIME_SERIES_INTRADAY];
      }

      if (resKeys.indexOf(FNCTN_VAL.TIME_SERIES_DAILY_ADJUSTED) > -1) {
        data = res[FNCTN_VAL.TIME_SERIES_DAILY_ADJUSTED];
        type = FNCTN_VAL.TIME_SERIES_DAILY_ADJUSTED;
      }

      if (resKeys.indexOf(FNCTN_VAL.TIME_SERIES_WEEKLY_ADJUSTED) > -1) {
        type = FNCTN_VAL.TIME_SERIES_WEEKLY_ADJUSTED;
        data = res[FNCTN_VAL.TIME_SERIES_WEEKLY_ADJUSTED];
      }

      if (resKeys.indexOf(FNCTN_VAL.TIME_SERIES_MONTHLY_ADJUSTED) > -1) {
        type = FNCTN_VAL.TIME_SERIES_MONTHLY_ADJUSTED;
        data = res[FNCTN_VAL.TIME_SERIES_MONTHLY_ADJUSTED];
      }

      // save the new response for the new request into session to avoid extra api calls.
      const responseData = arrangeResponse(data, type);
      sessionStorage.setItem(
        'Stock',
        JSON.stringify({
          stockData: responseData,
          functionName,
          stockName,
          timeInterval,
        })
      );
      return responseData;
    })
    .catch((err) => {
      console.log(err);
      return { error: err[Object.keys(err)[0]] };
    });
};

// fetch recent response: 5years/5 months/ 5 weeks/ 5 days
export const getRecent = (xdata = [], ydata = [], functionName = '') => {
  const filteredX = [];
  const filteredY = [];
  // get the first element of x-axis.
  const oneHour = 1000 * 60 * 60;
  const lastHours = 10 * oneHour;
  const lastDays = 10 * oneHour * 24;
  const lastWeeks = 10 * 30 * oneHour * 24;
  const lastMonths = 10 * 12 * 30 * oneHour * 24;
  let timeLimit = '';
  let addYear = null;
  if (functionName === FNCTN_KEY.intraday || functionName === FNCTN_KEY.daily) {
    const range = functionName === FNCTN_KEY.intraday ? lastHours : lastDays;
    addYear = '21';
    const firstItemOnX = new Date(
      `${xdata[0].split(' ')[0]}-${addYear} ${xdata[0].split(' ')[1]}`
    ).getTime();
    timeLimit = firstItemOnX - range;

    xdata.forEach((item, i) => {
      if (
        timeLimit <
        new Date(
          `${item.split(' ')[0]}-${addYear} ${item.split(' ')[1]}`
        ).getTime()
      ) {
        filteredX.push(item);
        filteredY.push(ydata[i]);
      }
    });
    return { filteredX, filteredY };
  }
  if (functionName === FNCTN_KEY.weekly || functionName === FNCTN_KEY.monthly) {
    const range = functionName === FNCTN_KEY.weekly ? lastWeeks : lastMonths;
    const firstItemOnX = new Date(xdata[0]).getTime();
    timeLimit = firstItemOnX - range;

    xdata.forEach((item, i) => {
      if (timeLimit < new Date(item).getTime()) {
        filteredX.push(item);
        filteredY.push(ydata[i]);
      }
    });
    return { filteredX, filteredY };
  }
  return null;
};
