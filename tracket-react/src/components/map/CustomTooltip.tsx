import { Tooltip } from 'react-leaflet';
import { CustomTooltipProps } from '../../types/components';

const CustomTooltip = ({ activeStatus, locationLabel }: CustomTooltipProps) => {
  return (
    <Tooltip>
      <div>
        <b>{activeStatus}</b>
        <br></br>
        {locationLabel}
      </div>
    </Tooltip>
  );
};

export default CustomTooltip;
