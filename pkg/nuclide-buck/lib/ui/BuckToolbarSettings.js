/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {TaskSettings, TaskType} from '../types';

import {React} from 'react-for-atom';
import {quote} from 'shell-quote';

import {shellParse} from '../../../commons-node/string';
import {AtomInput} from '../../../nuclide-ui/AtomInput';
import {Button, ButtonTypes} from '../../../nuclide-ui/Button';
import {ButtonGroup} from '../../../nuclide-ui/ButtonGroup';
import {Modal} from '../../../nuclide-ui/Modal';

type Props = {
  currentBuckRoot: ?string,
  settings: TaskSettings,
  buildType: TaskType,
  onDismiss: () => void,
  onSave: (settings: TaskSettings) => void,
};

type State = {
  arguments: string,
  runArguments: string,
};

export default class BuckToolbarSettings extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    const {arguments: args, runArguments} = props.settings;
    this.state = {
      arguments: args == null ? '' : quote(args),
      runArguments: runArguments == null ? '' : quote(runArguments),
    };
  }

  render(): React.Element<any> {
    let runArguments;
    if (this.props.buildType === 'debug' || this.props.buildType === 'run') {
      runArguments = (
        <div>
          <label>Run Arguments:</label>
          <AtomInput
            tabIndex="0"
            initialValue={this.state.runArguments}
            placeholderText="Custom command-line arguments to pass to the app/binary"
            onDidChange={this._onRunArgsChange.bind(this)}
            onConfirm={this._onSave.bind(this)}
          />
        </div>
      );
    }

    return (
      <Modal onDismiss={this.props.onDismiss}>
        <div className="block">
          <div className="block">
            <h5>
              Buck Settings for build type: <b>{this.props.buildType}</b>
            </h5>
            <label>Current Buck root:</label>
            <p>
              <code>
                {this.props.currentBuckRoot || 'No Buck project found.'}
              </code>
            </p>
            <label>Buck Arguments:</label>
            <AtomInput
              tabIndex="0"
              initialValue={this.state.arguments}
              placeholderText="Extra arguments to Buck (e.g. --num-threads 4)"
              onDidChange={this._onArgsChange.bind(this)}
              onConfirm={this._onSave.bind(this)}
            />
            {runArguments}
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <ButtonGroup>
              <Button onClick={this.props.onDismiss}>
                Cancel
              </Button>
              <Button
                buttonType={ButtonTypes.PRIMARY}
                onClick={this._onSave.bind(this)}>
                Save
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Modal>
    );
  }

  _onArgsChange(args: string) {
    this.setState({arguments: args});
  }

  _onRunArgsChange(args: string) {
    this.setState({runArguments: args});
  }

  _onSave() {
    try {
      this.props.onSave({
        arguments: shellParse(this.state.arguments),
        runArguments: shellParse(this.state.runArguments),
      });
    } catch (err) {
      atom.notifications.addError(
        'Could not parse arguments',
        {detail: err.stack},
      );
    }
  }

}
