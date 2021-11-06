import { LeftLogo, RightLogo } from '../../atoms';
import { HeaderContainer, Toolbar } from './style';

const Header = ({ title }) => {
  return (
    <HeaderContainer>
      <Toolbar>
        <RightLogo>{title}</RightLogo>

        <div style={{ flexGrow: 1 }} />

        <LeftLogo />
      </Toolbar>
    </HeaderContainer>
  );
};

export default Header;
