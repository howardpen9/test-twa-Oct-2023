import { TonConnectButton } from "@tonconnect/ui-react";
import { useCollectionContract } from "../hooks/callNFTContract";
import { useTonConnect } from "../hooks/useTonConnect";

import {
  Card,
  FlexBoxCol,
  FlexBoxRow,
  Ellipsis,
  Button,
} from "./styled/styled";

export function Collection() {
  const { connected } = useTonConnect();
  const {index, value, address, send } = useCollectionContract();

  return (
    <div className="Container">
      <TonConnectButton />

      <Card>
        <FlexBoxCol>
          <h3>NFT Collection</h3>
          <FlexBoxRow>
            <b>Address</b>
            <Ellipsis>{address}</Ellipsis>
          </FlexBoxRow>
          <FlexBoxRow>
            <i>Owner: </i>
            <div>{value ?? "Loading..."}</div>
          </FlexBoxRow>
          <FlexBoxRow>
            <i>Index: </i>
            <div>{index?.toString() ?? "Loading..."}</div>
          </FlexBoxRow>
          <Button
            disabled={!connected}
            className={`Button ${connected ? "Active" : "Disabled"}`}
            onClick={() => {
              send();
            }}
          >
            Mint NFT Item
          </Button>
        </FlexBoxCol>
      </Card>
    </div>
  );
}
