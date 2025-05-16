import TailwindConfig from 'tailwind.config';
const colors: any = TailwindConfig?.theme?.extend?.colors;
colors.gray500 = '#6B7280';
colors.gray400 = '#9CA3AF';
colors.white = '#FFF';
export default colors;
