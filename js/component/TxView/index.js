import React from "react";

export default class TxView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <div class="txPreview">
          <div class="vin">
            <div class="heading">
              From <span style={{float:'right'}}>Amount</span>
            </div>
            <ul class="vinvoutList">
              {this.props.vin.map(input => (
                <li>
                  <div class="addresses">
                    {input.scriptPubKey.addresses ? (
                      input.scriptPubKey.addresses.map(address => (
                        <React.Fragment>
                          <span>{address}</span>
                          <br />
                        </React.Fragment>
                      ))
                    ) : (
                      <span>Address couldn't be decoded</span>
                    )}
                  </div>
                  <div class="value">
                    {(input.value / 100000000).toFixed(8)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div class="vout">
            <div class="heading">To</div>
            <ul class="vinvoutList">
              {this.props.vout.map(output => (
                <li>
                  <div class="addresses">
                    {output.scriptPubKey.addresses.map(address => (
                      <React.Fragment>
                        <span>
                          {address}
                          {output.flags && "change".indexOf(output.flags) !== -1
                            ? "(change)"
                            : null}
                        </span>
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                  <div class="value">
                    {(output.value / 100000000).toFixed(8)}
                  </div>
                </li>
              ))}
              <li>
                <div class="addresses">Network Fee</div>
                <div class="value">{(this.props.fee / 100000000).toFixed(8)}</div>
              </li>
            </ul>
          </div>
          <div class="summary">
            <div class="heading">Summary</div>
            <ul class="vinvoutList">
              <li>
                <div class="addresses">Total</div>
                <div class="value">
                  {(this.props.totalSpent / 100000000).toFixed(8)}
                </div>
              </li>
            </ul>
          </div>
        </div>
        {!this.props.signable ? (
          <div class="adviceRow">
            <div class="advice advice--red">
              <ul class="adviceList">
                <li>
                  You don't have all required keys to sign this transaction.
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}
