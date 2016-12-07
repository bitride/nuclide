'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Platform} from '../../nuclide-buck/lib/types';
import type {PlatformService} from '../../nuclide-buck/lib/PlatformService';

import {Disposable} from 'atom';
import {Observable} from 'rxjs';
import * as IosSimulator from '../../nuclide-ios-common';

let disposable: ?Disposable = null;

export function deactivate(): void {
  if (disposable != null) {
    disposable.dispose();
    disposable = null;
  }
}

export function consumePlatformService(service: PlatformService): void {
  disposable = service.register(provideIosDevices);
}

function provideIosDevices(ruleType: string): Observable<?Platform> {
  if (ruleType !== 'apple_bundle') {
    return Observable.of(null);
  }
  return IosSimulator.getDevices().map(devices => ({
    name: 'iOS Simulators',
    devices: devices.map(device => ({
      name: device.name,
      udid: device.udid,
      flavor: 'iphonesimulator-x86_64',
    })),
  }));
}
