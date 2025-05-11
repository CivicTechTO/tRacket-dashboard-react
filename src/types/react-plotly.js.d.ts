declare module 'react-plotly.js' {
  import * as React from 'react';
  import { Plotly } from 'plotly.js';

  export interface PlotlyComponentProps {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    onInitialized?: (figure: Plotly.Figure) => void;
    onUpdate?: (figure: Plotly.Figure) => void;
    onError?: (error: Error) => void;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    divId?: string;
  }

  export default class Plot extends React.Component<PlotlyComponentProps> {}
}
