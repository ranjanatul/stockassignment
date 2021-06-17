import React, { useEffect, useState } from 'react';
import './App.css';
import BarChart from './BarChart';
import ErrorMsg from './ErrorMsg';
import Loader from './Loader';
import { getRecent, getStock } from './stock.actions';
import { CHART, FNCTN_KEY, FNCTN_VAL, KEY, MSG, NAMES } from './stock.const';

function App() {
  const dark = {
    backgroundColor: '#282c34',
    color: 'white',
  };
  const light = {
    color: '#282c34',
    backgroundColor: 'white',
  };
  const buttonTheme = {
    border: 'none',
    background: 'transparent',
  };

  const [theme, setTheme] = useState(dark);
  const [xdata, setxData] = useState([]);
  const [filteredX, setFilteredX] = useState([]);
  const [yLowdata, setyLowData] = useState([]);
  const [yHighdata, setyHighData] = useState([]);
  const [filteredY, setFilteredY] = useState([]);
  const [stockName, setStockName] = useState(KEY.GOGL);
  const [functionName, setFunctionName] = useState(FNCTN_KEY.weekly);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [chartType, setChartType] = useState(CHART.BAR);
  const [filterData, setFilterData] = useState(false);
  // const [timeInterval, setTimeInterval] = useState(60);
  const timeInterval = 60;
  const height = '450px';
  const isThemeDark = (selectedtheme) =>
    JSON.stringify(selectedtheme) === JSON.stringify(dark);

  const reset = () => {
    setyHighData([]);
    setyLowData([]);
    setxData([]);
  };

  const getFilteredData = (e) => {
    if (e.target.checked) {
      const { filteredX, filteredY } = getRecent(
        xdata,
        yHighdata,
        functionName
      );
      setFilteredX([...filteredX]);
      setFilteredY([...filteredY]);
    }

    return null;
  };

  useEffect(() => {
    setLoading(true);
    reset();
    getStock({ functionName, stockName, timeInterval })
      .then((data) => {
        const { xAxis, yAxislow, yAxishigh, error } = data;
        if (error) return setMsg(error);
        setxData([...xAxis]);
        setyLowData([...yAxislow]);
        setyHighData([...yAxishigh]);

        if (filterData) {
          const { filteredX, filteredY } = getRecent(
            xAxis,
            yAxishigh,
            functionName
          );
          setFilteredX([...filteredX]);
          setFilteredY([...filteredY]);
        }
        setLoading(false);
        return null;
      })
      .catch((err) => {
        setMsg(err);
        setLoading(false);
        return null;
      });
  }, [stockName, functionName]);

  return (
    <div className="App" style={theme}>
      <header className="App-header"> {MSG.HEADER} </header>
      <div className="toggle">
        <div>
          <span>
            <button
              styles={buttonTheme}
              onClick={() => setTheme(isThemeDark(theme) ? light : dark)}
            >
              <i
                className={`fas fa-toggle${
                  isThemeDark(theme) ? '-on' : '-off'
                }`}
              ></i>{' '}
            </button>
          </span>
          <span>{MSG.MODE}</span>
        </div>
        <div>
          <span>{MSG.BAR}</span>
          <span>
            <button
              styles={buttonTheme}
              onClick={() =>
                setChartType(chartType === CHART.LINE ? CHART.BAR : CHART.LINE)
              }
            >
              <i
                className={`fas fa-toggle${
                  chartType === CHART.LINE ? '-on' : '-off'
                }`}
              ></i>{' '}
            </button>
          </span>
          <span>{MSG.LINE}</span>
        </div>
      </div>

      <div className="margin_auto">
        <span className="btn">
          <select
            name="stockName"
            onChange={(e) => setStockName(e.target.value)}
            defaultValue={stockName}
          >
            <option value={KEY.GOGL}>{NAMES.GOOGL}</option>
            <option value={KEY.AMZN}>{NAMES.AMZN}</option>
          </select>
        </span>
        <span className="btn">
          <select
            name="functions"
            onChange={(e) => setFunctionName(e.target.value)}
            defaultValue={functionName}
          >
            <option value={FNCTN_KEY.intraday}>
              {FNCTN_VAL[FNCTN_KEY.intraday]}
            </option>
            <option value={FNCTN_KEY.daily}>
              {FNCTN_VAL[FNCTN_KEY.daily]}
            </option>
            <option value={FNCTN_KEY.weekly}>
              {FNCTN_VAL[FNCTN_KEY.weekly]}
            </option>
            <option value={FNCTN_KEY.monthly}>
              {FNCTN_VAL[FNCTN_KEY.monthly]}
            </option>
          </select>
        </span>
      </div>
      <div className="checkbox">
        <span>
          <input
            type="checkbox"
            defaultChecked={filterData}
            onChange={(e) =>
              setFilterData((prevState) => {
                return setFilterData(!prevState);
              }, getFilteredData(e))
            }
          />
        </span>
        <span>Get Recent Data only!</span>
      </div>
      <div className="chart">
        {msg !== '' && !loading && <ErrorMsg err={msg} />}
        {loading && <Loader />}
        {!msg && !loading && (
          <React.Fragment>
            <div className="top_msg">{MSG.SUGGESTION}</div>
            <BarChart
              theme={theme}
              xdata={filterData ? filteredX : xdata}
              yLowdata={yLowdata}
              yHighdata={filterData ? filteredY : yHighdata}
              stockName={NAMES[stockName]}
              functionName={FNCTN_VAL[functionName]}
              height={height}
              chartType={chartType}
            />
          </React.Fragment>
        )}
      </div>
      <div className="footer">**** Demo ****</div>
    </div>
  );
}

export default App;
