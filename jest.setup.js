/* eslint-env jest */
jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default,
);
jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);
// Os ícones carregam fontes via expo-asset, que não roda no Jest.
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  const Icon = ({ name }) => require("react").createElement(Text, null, name);
  return { Ionicons: Icon };
});
