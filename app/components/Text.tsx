import {Text as TextReact} from 'react-native';

const Text = (props: any) => {
  return (
    <TextReact {...props} style={[{fontFamily: 'Ubuntu'}, props.style]}>
      {props.children}
    </TextReact>
  );
};

export default Text;
