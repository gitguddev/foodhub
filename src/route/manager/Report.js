import React, { Fragment, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useParams } from "react-router-dom";
import apiFetcher from "../../utils/apiFetcher";
import { Auth } from "../../utils/firebase";
import Loader from "../../utils/Loader";
import styled from "styled-components";
import numeral from "numeral";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chart from "chart.js";

import {
  faBackward,
    faChartBar,
    faFileInvoiceDollar,
  faForward,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const monthList = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฏาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const ReportTable = styled.table`
  th {
    background-color: #232323;
    color: white;
    width: calc(100% / 4);
  }
  td {
    border-bottom: 1px solid #232323;
  }
  td,
  th {
    padding: 10px;
    text-align: center;
  }
  font-size: 0.8em;
  border-collapse: collapse;
  .info + tr {
    overflow: hidden;
    font-size: 0;
    transition: all 0.3s;
    background-color: #eee;
  }
  .info:hover {
    background-color: #666;
    color: white;
    cursor: pointer;
  }
  .info:hover + tr {
    transition: all 0.2s;
    font-size: 0.8em;
    background-color: #fff !important;
  }

  .viewed {
    font-size: 1em !important;
    background-color: #fff !important;
  }
`;

const BillContainer = styled.div`
  background-color: #232323;
  color: white;
  padding: 15px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BillPaper = styled.div`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  margin: 15px 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 3px;
  align-items: center;
  font-size: calc(0.5vw + 0.5vh + 7px);
  background-color: white;
  color: black;
  border-radius: 4px;
`;

const BillStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: min-content;
  font-size: 0.8em;

  margin-top: 20px;
  width: 100%;
  z-index: 1;
  text-align: center;

  span:nth-child(1),
  span:nth-child(2),
  span:nth-child(3) {
    text-align: center !important;
    font-weight: bold;
  }
`;

const Button = styled.button`
  border: none;
  border-radius: 3px;
  background-color: ${(props) => (props.blue ? "blue" : "green")};
  color: white;
  padding: 5px 13px;
  transition: all 0.3s;

  &:hover {
    background-color: ${(props) => (props.blue ? "#000080" : "#002e00")};
    transition: all 0.3s;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  & > * {
    margin: 5px;
  }
`;

const PageButton = styled.button`
  background-color: ${(props) => (props.disabled ? "grey" : "white")};
  color: black;
  padding: 4px 9px;
  border-radius: 4px;
  margin: 0px 10px 10px 0px;
  align-self: flex-start;
  transition: all 0.1s;

  svg {
    color: #555;
  }

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
    background-color: #ccc;
    cursor: pointer;
    transition: all 0.1s;
  `}
  }
`;

function Bill({ sessions_id, table_number }) {
  const { restaurant_id } = useParams();
  const { data, error } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/bill/get.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}&sessions_id=${sessions_id}`,
  });
  const billRef = useRef(null);

  function Save() {
    billRef.current.style.overflow = "visible";
    html2canvas(billRef.current, {
      height: billRef.current.scrollHeight,
      backgroundColor: "#fff",
    }).then((canvas) => {
      window.location.href = canvas
        .toDataURL()
        .replace("image/png", "image/octet-stream");
      billRef.current.style.overflow = "auto";
    });
  }

  if (error) return error;
  if (data?.message === "success") {
    let width, height;
    if (window.screen.width > window.screen.height) {
      height = (window.screen.height / 100) * 80;
      width = height * 1.4124 - height;
    } else {
      width = (window.screen.width / 100) * 80;
      height = width * 1.4142;
    }
    return (
      <BillContainer>
        <BillPaperStyled billRef={billRef} width={width} data={data.result} />
        <ButtonContainer>
          <a onClick={Save}>
            <Button blue>
              <FontAwesomeIcon icon={faSave} /> บันทึก
            </Button>
          </a>
        </ButtonContainer>
      </BillContainer>
    );
  }
  return <Loader />;
}

function BillPaperStyled({ billRef, width, height, data }) {
  const eachItem = [
    <Fragment key={"head"}>
      <span>ชื่อรายการ</span>
      <span>จำนวน</span>
      <span>รวม</span>
    </Fragment>,
    ...data.map((map) => {
      const { name, quantity, total } = map;

      return (
        <Fragment key={map.sessions_id}>
          <span>{name}</span>
          <span>{quantity}</span>
          <span>{total}</span>
        </Fragment>
      );
    }),
  ];

  function CurrentDate({ data }) {
    const { year, month, day } = data;

    return (
      <span>
        {day} {monthList[month]} {parseInt(year) + 543}
      </span>
    );
  }

  return (
    <BillPaper ref={billRef} width={width} height={height}>
      <span>
        <u>
          <big>
            <big>{data[0].restaurant_name}</big>
          </big>
        </u>
      </span>
      <small style={{ marginBottom: 8 }}>โต๊ะที่ {data[0].table_number}</small>
      <small>
        วันที่ <CurrentDate data={data[0]} />
      </small>
      <small>ทั้งหมด {data.length} รายการ</small>
      <BillStyled>{eachItem}</BillStyled>
      <span style={{ marginTop: 25 }}>
        รวมทั้งสิ้น{" "}
        {numeral(
          data.reduce((current, value) => {
            return current + parseFloat(value.total);
          }, 0)
        ).format("0,0.00")}{" "}
        บาท
      </span>
    </BillPaper>
  );
}

function BillChart({ filter, year }) {
  const { restaurant_id } = useParams();
  const [chart, chartSet] = useState();
  const chartCTX = useRef();

  useEffect(() => {
    let chartHolder;
    if (chart) chart.destroy();
    async function Fetcher() {
      const json = await apiFetcher({
        url: `/manager/report/chart.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}&filter=${filter}&year=${year}`,
      });


      if (json.message === "success") {
        const priceMapped = [];
        const costMapped = [];
        let datasets;

        if (filter === "income") {
          datasets = [
            {
              label: "รายรับ",
              data: priceMapped,
              backgroundColor: "#500",
            },
            {
              label: "กำไร (หักต้นทุน)",
              data: costMapped,
              backgroundColor: "#777",
            }];
        } else {
          datasets = [
            {
              label: "จำนวนการใช้บริการ",
              data: priceMapped,
              backgroundColor: "#500",
            }
          ];
        }

        json.result.forEach((map) => {
          priceMapped[map.month] = map.total;
          if (map.cost) costMapped[map.month] = map.cost;
        });

        chartHolder = new Chart(chartCTX.current, {
          type: "bar",
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
          data: {
            labels: monthList,
            datasets
          },
        });
        chartSet(chartHolder);
      }
    }
    Fetcher();
  }, [filter, restaurant_id, year]);

  return <div style={{position: "relative"}}><canvas height={400} ref={chartCTX} id="chart"></canvas></div>
}

//Way to complex should be extract as smaller component.
function Report() {
  const { restaurant_id } = useParams();
  const [page, pageSet] = useState(0);
  const [year, yearSet] = useState(new Date().getFullYear());
  const [filter, filterSet] = useState("income");
  const { data, error, reload, setData, cancel } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/report/get.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}&page=${page}`,
  });
  const [billView, billViewSet] = useState(null);

  function handleBillView(id) {
    billViewSet(billView === id ? null : id);
  }

  useEffect(() => {
    setData({ message: "loading" }, reload);
    return cancel;
  }, [cancel, page, reload, restaurant_id, setData]);

  function pageChanger(count) {
    pageSet(page + count <= 0 ? 0 : page + count);
  }

  function pageTotal() {
    if (!(data.result?.length > 1)) return 0;
    const totalSessions = data.result[0].total_sessions;
    const totalPage = Math.ceil(totalSessions / 5);

    return totalPage;
  }

  function filterChanged(event) {
    filterSet(event.target.value);
  }

  function yearChange(event) {
    yearSet(event.target.value);
  }

  if (error) return error;
  if (data?.message === "success") {
    if (data.result?.length > 0) {
    return (
      <>
        <small>
          <FontAwesomeIcon style={{color: "#555"}} icon={faChartBar} /> กราฟรายงานประจำปี{" "}
          <select onChange={yearChange} value={(new Date().getFullYear()) + 543}>
            {/* <option disabled>ปัจจุบัน {(new Date().getFullYear()) + 543}</option> */}
            {data.result[0].year.split(",").filter((filter, index, array) => index !== array.length - 1).map((map, index) => <option key={map} value={map}>{parseInt(map) + 543}</option>)}
          </select>
          <small>
            <form onChange={filterChanged}>
              <label>
                <input
                  defaultChecked={true}
                  type="radio"
                  name="filter"
                  value="income"
                />{" "}
                ยอดรายได้
              </label>
              <label>
                <input type="radio" name="filter" value="quantity" />{" "}
                จำนวนการใช้บริการ
              </label>
            </form>
          </small>
        </small>
        <BillChart filter={filter} year={year} />
        <br/>
        <small>
          <FontAwesomeIcon style={{color:"#555"}} icon={faFileInvoiceDollar} /> ประวัติการชำระ{" "}
          <small>
            หน้า {page + 1} จาก {pageTotal()}
          </small>
          <br />
          <PageButton disabled={page <= 0} onClick={() => pageChanger(-1)}>
            <FontAwesomeIcon icon={faBackward} /> ย้อนกลับ
          </PageButton>
          <PageButton
            disabled={page + 1 >= pageTotal()}
            onClick={() => pageChanger(1)}
          >
            <FontAwesomeIcon icon={faForward} /> ถัดไป
          </PageButton>
        </small>
        <ReportTable>
          <thead>
            <tr>
              <th>หมายเลขเซสชั่น</th>
              <th>เลขที่โต๊ะ</th>
              <th>จำนวนอาหาร</th>
              <th>รวมสุทธิ</th>
            </tr>
          </thead>
          <tbody>
            {data.result?.length > 0 &&
              data.result.map((map) => {
                return (
                  <Fragment key={map.id}>
                    <tr
                      className="info"
                      onClick={() => handleBillView(map.id)}
                    >
                      <td>{map.id}</td>
                      <td>{map.table_number}</td>
                      <td>{map.quantity}</td>
                      <td>{numeral(map.total).format("0,0.00")}</td>
                    </tr>
                    {billView === map.id ? (
                      <tr className="viewed">
                        <td colSpan={4}>
                          <Bill
                            table_number={map.table_number}
                            sessions_id={map.id}
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4}>ตรวจสอบใบเสร็จ</td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </ReportTable>
      </>
    );
    } else {
      return "ยังไม่เคยมำการชำระเงินภายในร้านนี้ !";
    }
  }
  return <Loader />;
}

export default Report;
