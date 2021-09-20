import React from "react";
import { View, TouchableOpacity, Text } from "@react-easy-ui/core-components";
import { createUniqueId, getRenderComponent } from "@react-easy-ui/utility-functions";

const closeNextViews = (props) => {
  const { navigation: { getLastViewIndex, getCurrentViewIndex, pop } = {} } =
    props || {};
  const lastIndex = (getLastViewIndex && getLastViewIndex()) || 0;
  const currentIndex = (getCurrentViewIndex && getCurrentViewIndex()) || 0;
  if (lastIndex > currentIndex) {
    pop(lastIndex - currentIndex);
  }
};

const TabNavigator = (tabProps) => {
  const { tabs, theme, tabPosition = "top", actions } = tabProps || {};
  class TabNavigatorComponent extends React.Component {
    constructor(props) {
      super(props);
      this.tabUniqueName = createUniqueId();
      const { navigation } = props;
      let { activeTab } =
        (navigation?.getParams && navigation.getParams()) || {};
      const tabKeys = Object.keys(tabs);
      this.visibleTabs = tabKeys.filter((tabKey) => {
        let { visible = true } = tabs[tabKey];
        if (typeof visible === "function") {
          visible = visible({ navigation });
        }
        return visible;
      });
      if (
        Array.isArray(this.visibleTabs) &&
        !this.visibleTabs.includes(activeTab)
      ) {
        activeTab = this.visibleTabs[0];
      }
      this.state = { activeTab };
    }

    onChangeTab = (activeTab) => {
      closeNextViews(this.props);
      this.setState({ activeTab });
    };

    getTabChangeFunction = (activeTab) => () => {
      this.onChangeTab(activeTab);
    };

    renderTab = () => {
      let {
        tabStyle: {
          containerStyle,
          activeContainerStyle,
          labelStyle,
          activeLabelStyle,
        } = {},
      } = theme || {};
      if (typeof containerStyle === "function") {
        containerStyle = containerStyle({
          tabBarLength: this.visibleTabs.length,
        });
      }
      const { renderTab, navigation } = this.props;
      const { activeTab } = this.state;
      const tabsBar = this.visibleTabs.map((tabKey, index) => {
        if (typeof renderTab === "function") {
          return renderTab({
            key: `tab-${this.tabUniqueName}${index}`,
            navigation,
            tabData: tabs[tabKey],
            index,
          });
        }
        const isActive = activeTab === tabKey;
        console.log("test!!>>>>>>", tabs, tabKey, tabs[tabKey]?.label);
        return (
          <TouchableOpacity
            key={`tab-${this.tabUniqueName}${index}`}
            // activeOpacity={isActive && 1}
            disabled={isActive}
            onPress={this.getTabChangeFunction(tabKey)}
            style={{
              cursor: "pointer",
              ...containerStyle,
              ...(isActive && activeContainerStyle),
            }}
          >
            <Text style={{ ...labelStyle, ...(isActive && activeLabelStyle) }}>
              {tabs[tabKey]?.label}
            </Text>
          </TouchableOpacity>
        );
      });
      return tabsBar;
    };

    getTabFunction = () => {
      let { activeTab, tabState } = this.state;
      tabState = { ...tabState };
      const screenFunction = {};
      screenFunction.getTabState = () => {
        return tabState[activeTab];
      };
      screenFunction.setTabState = (state) => {
        tabState = {
          ...tabState,
          [activeTab]: { ...tabState[activeTab], ...state },
        };
        this.setState({ tabState });
      };
      return screenFunction;
    };

    render() {
      if (!Array.isArray(this.visibleTabs) || !this.visibleTabs.length) {
        return null;
      }
      const { activeTab } = this.state;
      const { navigation } = this.props;
      const getTabStateAndSetter = this.getTabFunction();
      const CurrentScreen = tabs[activeTab]?.screen;
      const { containerStyle, tabBarStyle, screenContainerStyle } = theme || {};
      let actionComponents = void 0;
      if (Array.isArray(actions) && actions.length) {
        actionComponents = (
          <View style={{ flexDirection: "row" }}>
            {actions.map((action, index) => {
              return getRenderComponent(action, {
                key: `action-${this.tabUniqueName}${index}`,
                index: index,
                navigation: { ...navigation, ...getTabStateAndSetter },
                navigatorName: this.tabUniqueName,
              });
            })}
          </View>
        );
      }
      return (
        <View style={{ flex: 1, backgroundColor: "white", ...containerStyle }}>
          {tabPosition !== "bottom" ? (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "white",
                ...tabBarStyle,
              }}
            >
              <View style={{ flex: 1 }}>{this.renderTab()}</View>
              {actionComponents}
            </View>
          ) : (
            void 0
          )}
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              ...screenContainerStyle,
            }}
          >
            <CurrentScreen
              navigation={{ ...navigation, ...getTabStateAndSetter }}
            />
          </View>
          {tabPosition === "bottom" ? (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "white",
                ...tabBarStyle,
              }}
            >
              <View style={{ flexDirection: "row", flex: 1 }}>
                {this.renderTab()}
                {actionComponents}
              </View>
            </View>
          ) : (
            void 0
          )}
        </View>
      );
    }
  }
  return TabNavigatorComponent;
};

export { TabNavigator };
