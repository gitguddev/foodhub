import React from "react";
import { useAsync } from "react-async";
import apiFetcher from "../../utils/apiFetcher";
import { Auth } from "../../utils/firebase";
import { useSocket } from "../../utils/socket.io";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

const statusMessage = [
  "กำลังรอการยืนยัน",
  "อยู่ในกระบวนการทำ",
  "เสิร์ฟแล้ว",
  "ยกเลิกแล้ว",
];

const OrderTable = styled.table`
  border-collapse: collapse;
  font-size: 0.85em;
  border: 1px solid #232323;
  border-radius: 3px;
  box-sizing: border-box;

  th {
    background-color: #232323;
    color: white;
  }
  td {
    border-bottom: 1px solid #232323;
  }
  td,
  th {
    text-align: center;
    padding: 5px;
    width: calc(100% / 5) !important;
    overflow: hidden;
  }
  .foodImage {
    width: 100px;
    height: 80px;
    object-fit: cover;
    background-color: #ccc;
    border-radius: 3px;
  }
  .statusOperator {
    margin-top: 10px;
    display: flex;
    justify-content: center;
  }
  .statusOperator > svg {
    margin: 0px 10px;
  }

  @media only screen and (max-width: 800px) {
    .imageCell {
      display: none;
    }
  }
`;

const OperateButton = styled(FontAwesomeIcon)`
  color: ${(props) => (props.danger ? "red" : "green")};

  &:hover {
    opacity: 0.3;
    cursor: pointer;
    transition: all 0.1s;
  }
`;

function OrderQueue() {
  const { restaurant_id } = useParams();
  const socket = useSocket(restaurant_id);
  const { data, error, reload } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/order/select.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  if (socket) socket.on("order", reload);

  async function handleCancel(index) {
    const json = await apiFetcher({
      url: `/manager/order/cancel.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}&id=${data.result[index].id}`,
    });

    if (json.message === "success") {
      socket.emit("update");
      reload();
    } else {
      console.error(json.message);
    }
  }
  async function handleUpdate(index) {
    const json = await apiFetcher({
      url: `/manager/order/update.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}&id=${data.result[index].id}`,
    });

    if (json.message === "success") {
      socket.emit("update");
      reload();
    } else {
      console.error(json.message);
    }
  }

  if (error) return error;
  if (data?.message === "success" && socket)
    return (
      <OrderTable>
        <thead>
          <tr>
            <th className="imageCell">รูปอาหาร</th>
            <th>ชื่ออาหาร</th>
            <th>จำนวน</th>
            <th>โต๊ะ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {data.result?.length > 0
            ? data.result
                .filter((filter) => filter.status < 2)
                .map((map, index) => (
                  <tr key={map.id}>
                    <td className="imageCell">
                      <img className="foodImage" src={map.img} alt="food" />
                    </td>
                    <td>{map.name}</td>
                    <td>{map.quantity}</td>
                    <td>{map.restaurant_number}</td>
                    <td>
                      {statusMessage[map.status]}
                      <div className="statusOperator">
                        {map.status >= 0 && map.status < 2 && (
                          <OperateButton
                            icon={faCheck}
                            onClick={() => handleUpdate(index)}
                          />
                        )}
                        {map.status <= 0 && (
                          <OperateButton
                            icon={faTimes}
                            onClick={() => handleCancel(index)}
                            danger="true"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            : "ไม่มีคำสั่งซื้อในขณะนี้"}
        </tbody>
      </OrderTable>
    );
  return "Loading";
}

export default OrderQueue;
