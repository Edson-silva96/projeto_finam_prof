document.addEventListener("DOMContentLoaded", () => {
  const chartContainer = document.getElementById("tvChartContainer");
  const subChartContainer = document.getElementById("subChartContainer");

  const btnOverlayVelas = document.getElementById("btnOverlayVelas");
  const btnOverlayBarras = document.getElementById("btnOverlayBarras");
  const btnOverlayLinha = document.getElementById("btnOverlayLinha");
  const periodSelector = document.getElementById("periodSelector");
  const assetSelector = document.getElementById("assetSelector");

  // Formatação Monetária BRL (R$)
  const formatBRL = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Mapeamento Completo de 35 Ativos
  const assetConfigs = {
    // Principais
    "PETR4":  { basePrice: 38.50, volatility: 0.85 },
    "VALE3":  { basePrice: 61.20, volatility: 1.10 },
    "ITUB4":  { basePrice: 33.40, volatility: 0.50 },
    "BBAS3":  { basePrice: 27.80, volatility: 0.45 },
    "BBDC4":  { basePrice: 14.10, volatility: 0.30 },

    // Ações B3
    "B3SA3":  { basePrice: 11.20, volatility: 0.25 },
    "ABEV3":  { basePrice: 12.00, volatility: 0.20 },
    "WEGE3":  { basePrice: 42.10, volatility: 0.70 },
    "RENT3":  { basePrice: 48.30, volatility: 0.90 },
    "PRIO3":  { basePrice: 46.80, volatility: 1.00 },
    "ELET3":  { basePrice: 39.10, volatility: 0.65 },
    "GGBR4":  { basePrice: 20.50, volatility: 0.40 },
    "SUZB3":  { basePrice: 53.40, volatility: 0.95 },
    "JBSS3":  { basePrice: 28.90, volatility: 0.60 },
    "RAIZ4":  { basePrice: 3.10,  volatility: 0.08 },
    "RDOR3":  { basePrice: 29.50, volatility: 0.55 },
    "LREN3":  { basePrice: 17.20, volatility: 0.35 },
    "VBBR3":  { basePrice: 24.10, volatility: 0.45 },
    "MGLU3":  { basePrice: 12.80, volatility: 0.30 },
    "CSNA3":  { basePrice: 13.40, volatility: 0.30 },
    "CPLE6":  { basePrice: 9.30,  volatility: 0.15 },
    "EQTL3":  { basePrice: 31.00, volatility: 0.45 },
    "EMBR3":  { basePrice: 37.50, volatility: 0.80 },
    "HAPV3":  { basePrice: 3.80,  volatility: 0.10 },

    // Units
    "KLBN11": { basePrice: 22.10, volatility: 0.35 },
    "SANB11": { basePrice: 28.50, volatility: 0.50 },
    "TOTS3":  { basePrice: 29.00, volatility: 0.55 },
    "VIVT3":  { basePrice: 50.20, volatility: 0.60 },
    "BBSE3":  { basePrice: 33.80, volatility: 0.40 },

    // ETFs
    "BOVA11": { basePrice: 122.00, volatility: 1.50 },
    "SMAL11": { basePrice: 98.50,  volatility: 1.20 },
    "IVVB11": { basePrice: 310.00, volatility: 3.50 },

    // Criptomoedas BRL
    "BTCBRL": { basePrice: 385000.00, volatility: 8500.00 },
    "ETHBRL": { basePrice: 18500.00,  volatility: 450.00 },
    "SOLBRL": { basePrice: 820.00,    volatility: 25.00 },
    "USDTBRL":{ basePrice: 5.45,      volatility: 0.05 }
  };

  const priceFormat2Decimals = {
    type: "price",
    precision: 2,
    minMove: 0.01,
  };

  const commonChartOptions = {
    layout: {
      background: { color: "#000000" },
      textColor: "#8b949e",
    },
    grid: {
      vertLines: { color: "#141414" },
      horzLines: { color: "#141414" },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    rightPriceScale: {
      borderColor: "#222222",
    },
    timeScale: {
      borderColor: "#222222",
      timeVisible: true,
      secondsVisible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
      rightOffset: 0,
    },
    localization: {
      locale: "pt-BR",
      priceFormatter: (price) =>
        `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  };

  // Determinar altura responsiva inicial
  function getResponsiveHeights() {
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth <= 768;

    if (isMobile) {
      return { mainHeight: 280, subHeight: 100 };
    } else if (isTablet) {
      return { mainHeight: 320, subHeight: 120 };
    } else {
      return { mainHeight: 420, subHeight: 160 };
    }
  }

  const initialHeights = getResponsiveHeights();

  // Instanciar Gráficos
  const mainChart = LightweightCharts.createChart(chartContainer, {
    ...commonChartOptions,
    width: chartContainer.clientWidth,
    height: initialHeights.mainHeight,
  });

  const subChart = LightweightCharts.createChart(subChartContainer, {
    ...commonChartOptions,
    width: subChartContainer.clientWidth,
    height: initialHeights.subHeight,
  });

  // Sincronizar Navegação de Tempo
  mainChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    subChart.timeScale().setVisibleLogicalRange(range);
  });
  subChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    mainChart.timeScale().setVisibleLogicalRange(range);
  });

  // Criar Séries
  const candleSeries = mainChart.addCandlestickSeries({
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderVisible: false,
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
    visible: true,
    priceFormat: priceFormat2Decimals,
  });

  const barSeries = mainChart.addBarSeries({
    upColor: "#26a69a",
    downColor: "#ef5350",
    openVisible: true,
    thinBars: false,
    visible: false,
    priceFormat: priceFormat2Decimals,
  });

  const lineSeries = mainChart.addLineSeries({
    color: "#2962ff",
    lineWidth: 2,
    visible: false,
    priceFormat: priceFormat2Decimals,
  });

  const ma20Series = mainChart.addLineSeries({
    color: "#e3b341",
    lineWidth: 2,
    priceFormat: priceFormat2Decimals,
  });

  const ma50Series = mainChart.addLineSeries({
    color: "#388bfd",
    lineWidth: 2,
    priceFormat: priceFormat2Decimals,
  });

  const areaBaselineSeries = subChart.addBaselineSeries({
    baseValue: { type: "price", price: 50 },
    topLineColor: "#26a69a",
    topFillColor1: "rgba(38, 166, 154, 0.45)",
    topFillColor2: "rgba(38, 166, 154, 0.05)",
    bottomLineColor: "#ef5350",
    bottomFillColor1: "rgba(239, 83, 80, 0.05)",
    bottomFillColor2: "rgba(239, 83, 80, 0.45)",
    lineWidth: 2,
    priceFormat: priceFormat2Decimals,
  });

  areaBaselineSeries.createPriceLine({
    price: 50,
    color: "#ffffff",
    lineWidth: 1,
    lineStyle: LightweightCharts.LineStyle.Dashed,
    axisLabelVisible: true,
    title: "CENTRAL (50)",
  });

  // Gerador de Dados Históricos
  function generateMockData(daysCount, assetSymbol) {
    const candles = [];
    const bars = [];
    const lineData = [];
    const areaData = [];

    const config = assetConfigs[assetSymbol] || { basePrice: 35.00, volatility: 0.80 };
    let basePrice = config.basePrice;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const timeStr = currentDate.toISOString().split("T")[0];

      const change = (Math.random() - 0.48) * config.volatility;
      const open = Number(basePrice.toFixed(2));
      const close = Number(Math.max(0.01, open + change).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * (config.volatility * 0.3)).toFixed(2));
      const low = Number((Math.max(0.01, Math.min(open, close) - Math.random() * (config.volatility * 0.3))).toFixed(2));

      const areaVal = Number(Math.min(Math.max(50 + (Math.random() - 0.5) * 50, 15), 85).toFixed(2));

      candles.push({ time: timeStr, open, high, low, close });
      bars.push({ time: timeStr, open, high, low, close });
      lineData.push({ time: timeStr, value: close });
      areaData.push({ time: timeStr, value: areaVal });

      basePrice = close;
    }

    return { candles, bars, lineData, areaData };
  }

  function calculateSMA(data, period) {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue;
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push({ time: data[i].time, value: Number((sum / period).toFixed(2)) });
    }
    return sma;
  }

  function getDaysFromPeriod(period) {
    switch (period) {
      case "1M": return 30;
      case "3M": return 90;
      case "1Y": return 365;
      default: return 30;
    }
  }

  // Carregar Dados
  function loadChartData() {
    const period = periodSelector.value;
    const daysCount = getDaysFromPeriod(period);
    const selectedAsset = assetSelector.value;

    const { candles, bars, lineData, areaData } = generateMockData(daysCount, selectedAsset);

    candleSeries.setData(candles);
    barSeries.setData(bars);
    lineSeries.setData(lineData);
    areaBaselineSeries.setData(areaData);

    const ma20Data = calculateSMA(candles, Math.min(10, daysCount));
    const ma50Data = calculateSMA(candles, Math.min(20, daysCount));

    ma20Series.setData(ma20Data);
    ma50Series.setData(ma50Data);

    mainChart.timeScale().fitContent();
    subChart.timeScale().fitContent();

    const lastCandle = candles[candles.length - 1];
    const lastAreaVal = areaData[areaData.length - 1];

    document.getElementById("valAbertura").textContent = formatBRL(lastCandle.open);
    document.getElementById("valFechamento").textContent = formatBRL(lastCandle.close);
    document.getElementById("valAltaBaixa").textContent = `${formatBRL(lastCandle.low)} / ${formatBRL(lastCandle.high)}`;
    document.getElementById("rsiValue").textContent = lastAreaVal.value.toFixed(2);
  }

  loadChartData();

  // Troca de overlays de visualização
  function switchChartType(type) {
    candleSeries.applyOptions({ visible: type === "candlestick" });
    barSeries.applyOptions({ visible: type === "bar" });
    lineSeries.applyOptions({ visible: type === "line" });

    btnOverlayVelas.classList.toggle("active", type === "candlestick");
    btnOverlayBarras.classList.toggle("active", type === "bar");
    btnOverlayLinha.classList.toggle("active", type === "line");
  }

  btnOverlayVelas.addEventListener("click", () => switchChartType("candlestick"));
  btnOverlayBarras.addEventListener("click", () => switchChartType("bar"));
  btnOverlayLinha.addEventListener("click", () => switchChartType("line"));

  periodSelector.addEventListener("change", () => loadChartData());

  assetSelector.addEventListener("change", (e) => {
    const symbol = e.target.value;
    document.getElementById("chartMainTitle").textContent = `Gráfico Diário ${symbol} - 20 MA & 50 MA`;
    loadChartData();
  });

  // Alternar Médias Móveis
  let ma20Visible = true;
  document.getElementById("toggleMa20").addEventListener("click", function () {
    ma20Visible = !ma20Visible;
    ma20Series.applyOptions({ visible: ma20Visible });
    this.classList.toggle("active", ma20Visible);
  });

  let ma50Visible = true;
  document.getElementById("toggleMa50").addEventListener("click", function () {
    ma50Visible = !ma50Visible;
    ma50Series.applyOptions({ visible: ma50Visible });
    this.classList.toggle("active", ma50Visible);
  });

  // Redimensionamento Dinâmico e Responsividade
  function applyResponsiveSizes() {
    const { mainHeight, subHeight } = getResponsiveHeights();
    mainChart.applyOptions({
      width: chartContainer.clientWidth,
      height: mainHeight,
    });
    subChart.applyOptions({
      width: subChartContainer.clientWidth,
      height: subHeight,
    });
  }

  window.addEventListener("resize", () => {
    applyResponsiveSizes();
    mainChart.timeScale().fitContent();
    subChart.timeScale().fitContent();
  });
});