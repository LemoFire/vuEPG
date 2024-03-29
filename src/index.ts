/* eslint-disable */
import { dataContainer } from "./lib/service";
import EPGItem from "./lib/epgItem";
import EPGGroup from "./lib/epgGroup";
import { isVue2, type DirectiveHook, type FunctionDirective } from "vue-demi";
import { PACKAGE_VERSION } from "./config/version";
import * as epgService from "./lib/service";
import * as keyActions from "./lib/keyActions";
import { selfLog } from "./lib/utils";

const _directive = (
  beforeMount: FunctionDirective,
  mounted: FunctionDirective,
  updated: FunctionDirective,
  unmounted: FunctionDirective
) => {
  let obj = {};
  if (isVue2) {
    obj = {
      bind: beforeMount,
      inserted: mounted,
      componentUpdated: updated,
      unbind: unmounted,
    };
  } else {
    obj = {
      beforeMount: beforeMount,
      mounted: mounted,
      updated: updated,
      unmounted: unmounted,
    };
  }
  return obj;
};

export default {
  install(app: any) {
    const groupBeforeMount: DirectiveHook<HTMLElement> = (
      el,
      binding,
      vnode
    ) => {};
    const groupMounted: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let group = new EPGGroup(vnode, binding);
      epgService.registerGroup(group);
    };
    const groupUpdated: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let item = new EPGGroup(vnode, binding);
      epgService.updateGroup(item);
    };
    const groupUnmount: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      const index = dataContainer.groupArray.findIndex(
        (item: EPGGroup) => item.id === el.dataset.epgGroupId
      );
      dataContainer.groupArray.splice(index, 1);
    };
    app.directive(
      "epg-group",
      _directive(groupBeforeMount, groupMounted, groupUpdated, groupUnmount)
    );
    const itemBeforeMount: DirectiveHook<HTMLElement> = (
      el,
      binding,
      vnode
    ) => {};
    const itemMounted: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let item = new EPGItem(vnode, binding);
      epgService.registerItem(item);
    };
    const itemsUpdated: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let item = new EPGItem(vnode, binding);
      epgService.updateItem(item);
    };
    const itemUnmounted: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      const index = dataContainer.itemArray.findIndex((item: EPGItem) => {
        if (dataContainer.currentItem) {
          if (dataContainer.currentItem.id === el.dataset.epgItemId) {
            selfLog("当前元素已经卸载，移除 CurrentItem");
            dataContainer.currentItem = null;
          }
        }
        return item.id === el.dataset.epgItemId;
      });
      if (index != -1) {
        dataContainer.itemArray.splice(index, 1);
      }
    };
    app.directive(
      "epg-item",
      _directive(itemBeforeMount, itemMounted, itemsUpdated, itemUnmounted)
    );
    if (!isVue2) {
      app.provide("epg", epgService);
    }
    console.log(
      "\n %c vuEPG loaded " +
        PACKAGE_VERSION +
        " %c https://docs.ito.fun/vuepg \n",
      "color: white; background: pink; padding:5px 0;",
      "background: skyblue; padding:5px 0;"
    );
  },
};

export const useVuEPG = () => {
  return { ...epgService, ...keyActions };
};
