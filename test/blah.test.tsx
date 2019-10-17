import * as React from 'react';
import * as ReactDOM from 'react-dom';
import LineSegmentSliderInput from '../src/index';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <LineSegmentSliderInput
        width={500}
        height={500}
        from={[0.2, 0.2]}
        to={[0.8, 0.8]}
        stops={[
          {
            position: 0,
            color: 'white',
          },
          {
            position: 0.2,
            color: 'white',
          },
          {
            position: 1,
            color: 'white',
          },
        ]}
        index={-1}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
