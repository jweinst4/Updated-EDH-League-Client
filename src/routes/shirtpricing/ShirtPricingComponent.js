import React, { useState, useEffect, useContext } from 'react';
import { Column, Row } from 'simple-flexbox';
import { createUseStyles } from 'react-jss';
import CardComponent from 'components/cards/CardComponent';
import { StoreContext } from "../../context/store/storeContext";
import LoadingComponent from '../../components/loading';
import * as apiServices from '../../resources/api';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import 'react-toastify/dist/ReactToastify.css';
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
import { FaLock } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

const useStyles = createUseStyles({

    cardsContainer: {
        marginRight: -30,
        marginTop: -30
    },
    cardRow: {
        marginTop: 30,
        '@media (max-width: 768px)': {
            marginTop: 0
        },
        flex: 0.6
    },
    miniCardContainer: {
        flexGrow: 1,
        marginRight: 30,
        '@media (max-width: 768px)': {
            marginTop: 30,
            maxWidth: 'none'
        }
    },
    todayTrends: {
        marginTop: 30
    },
    lastRow: {
        marginTop: 30
    },
    unresolvedTickets: {
        marginRight: 30,
        '@media (max-width: 1024px)': {
            marginRight: 0
        }
    },
    tasks: {
        marginTop: 0,
        '@media (max-width: 1024px)': {
            marginTop: 30
        }
    }
});

function ShirtPricingComponent() {
    const classes = useStyles();
    const { actions, state } = useContext(StoreContext);
    const [pricing, setPricing] = useState();
    const [shirtCost, setShirtCost] = useState();
    const [markUp, setMarkUp] = useState();
    const [printSideOneColors, setPrintSideOneColors] = useState();
    const [printSideTwoColors, setPrintSideTwoColors] = useState();
    const [shirtQuantity, setShirtQuantity] = useState();
    const [netCost, setNetCost] = useState();
    const [printSideOneCost, setPrintSideOneCost] = useState();
    const [printSideTwoCost, setPrintSideTwoCost] = useState();
    const [profit, setProfit] = useState();
    const [totalCost, setTotalCost] = useState();
    const [totalProfit, setTotalProfit] = useState();

    const [shirtQuantityBucket, setShirtQuantityBucket] = useState();

    const [dbPrices, setdbPrices] = useState();

    const {
        register,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({
        mode: "onBlur",
    });

    useEffect(() => {
        const fetchData = async () => {
            actions.generalActions.setisbusy()
            await apiServices.getShirtPrices()
                .then(res => {
                    setdbPrices(res.data);
                    actions.generalActions.resetisbusy();
                })
                .catch(err => console.log(err.response))
        }
        fetchData().catch(console.error);
    }, []);

    if (state.generalStates.isBusy) {
        return <LoadingComponent loading />
    }

    const getShirtQuantityBucket = (shirtQuantity) => {
        switch (true) {
            case (shirtQuantity >= 6 && shirtQuantity <= 11):
                return '6-11';
            case (shirtQuantity >= 12 && shirtQuantity <= 36):
                return '12-36';
            case (shirtQuantity >= 37 && shirtQuantity <= 72):
                return '37-72';
            case (shirtQuantity >= 73 && shirtQuantity <= 144):
                return '73-144';
            case (shirtQuantity >= 145 && shirtQuantity <= 287):
                return '145-287';
            case (shirtQuantity >= 288 && shirtQuantity <= 499):
                return '288-499';
            case (shirtQuantity >= 500 && shirtQuantity <= 999):
                return '500-999';
            case (shirtQuantity >= 1000 && shirtQuantity <= 4999):
                return '1000-4999';
            case (shirtQuantity >= 5000):
                return '5000+';
            default:
                console.log(`Quantity Not Found`);
        }
    }

    const getPrintCost = (shirtQuantityBucket, numberOfColors) => {
        return parseFloat(dbPrices.find(obj =>
            obj.quantity == shirtQuantityBucket && obj.colors === parseInt(numberOfColors)
        ).price)
    }

    const lightAndDarkPricingComponent = () => {
        return <Row>
            <Column flex={.5}>
                <ToastContainer />
                <form
                    onSubmit={handleSubmit(async (data) => {
                        const shirtCost = parseFloat(data.shirtCost);
                        const shirtQuantity = parseInt(data.quantity);
                        const markUp = parseFloat(data.markUp);
                        const printSideOneColors = data.printSideOneColors;
                        const printSideTwoColors = data.printSideTwoColors;

                        setPricing(data);
                        setShirtQuantity(parseInt(shirtQuantity));
                        setShirtCost(shirtCost);
                        setMarkUp(markUp);
                        setPrintSideOneColors(printSideOneColors);
                        setPrintSideTwoColors(printSideTwoColors);

                        const shirtQuantityBucket = getShirtQuantityBucket(shirtQuantity);
                        setShirtQuantityBucket(shirtQuantityBucket);

                        const printSideOneCost = printSideOneColors ? getPrintCost(shirtQuantityBucket, printSideOneColors) : 0;
                        setPrintSideOneCost(printSideOneCost);

                        const printSideTwoCost = printSideTwoColors ? getPrintCost(shirtQuantityBucket, printSideTwoColors) : 0;
                        setPrintSideTwoCost(printSideTwoCost);

                        const netCost = (printSideOneCost + printSideTwoCost + shirtCost)
                        setNetCost(netCost);

                        const profit =
                            (netCost * (markUp / 100))
                        setProfit(profit);

                        setTotalCost((netCost * shirtQuantity));
                        setTotalProfit((profit * shirtQuantity));

                        reset();
                    })}
                >
                    <Row style={{ margin: '10px' }}>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            Quantity
                        </Column>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            <input style={{}} {...register("quantity")} />
                        </Column>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            Print Side One Colors
                        </Column>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            <input style={{}} {...register("printSideOneColors")} />
                        </Column>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            Print Side Two Colors
                        </Column>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            <input style={{}} {...register("printSideTwoColors")} />
                        </Column>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            Shirt Cost (1.50 for $1.50, 2.00 for $2.00, etc.)
                        </Column>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            <input style={{}} {...register("shirtCost")} />
                        </Column>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            Mark Up (50 for 50%, 100 for 100%, etc.)
                        </Column>
                        <Column flex={.5} style={{ marginRight: '10px' }}>
                            <input style={{}} {...register("markUp")} />
                        </Column>
                    </Row>
                    <AwesomeButton size="large" type="secondary">
                        Get Price Quote
                    </AwesomeButton>
                </form>
            </Column>
            <Column flex={0.5}>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Quantity:
                    </Column>
                    <Column flex={0.5}>
                        {shirtQuantity ? shirtQuantity : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Print Side One Colors:
                    </Column>
                    <Column flex={0.5}>
                        {printSideOneColors ? printSideOneColors : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Print Side Two Colors:
                    </Column>
                    <Column flex={0.5}>
                        {printSideTwoColors ? printSideTwoColors : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Print Side One Cost:
                    </Column>
                    <Column flex={0.5}>
                        ${shirtQuantity && printSideOneColors ? (Math.round(printSideOneCost * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Print Side Two Cost:
                    </Column>
                    <Column flex={0.5}>
                        ${shirtQuantity && printSideTwoColors ? (Math.round(printSideTwoCost * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Shirt Cost:
                    </Column>
                    <Column flex={0.5}>
                        ${shirtCost ? (Math.round(shirtCost * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Net Cost:
                    </Column>
                    <Column flex={0.5}>
                        ${netCost ? (Math.round(netCost * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Mark Up:
                    </Column>
                    <Column flex={0.5}>
                        {markUp ? (Math.round(markUp * 100) / 100).toFixed(2) : 0}%
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Profit:
                    </Column>
                    <Column flex={0.5}>
                        ${profit ? (Math.round(profit * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Total Cost:
                    </Column>
                    <Column flex={0.5}>
                        ${totalCost ? (Math.round(totalCost * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
                <Row style={{ margin: '10px' }}>
                    <Column flex={0.5}>
                        Total Profit:
                    </Column>
                    <Column flex={0.5}>
                        ${totalProfit ? (Math.round(totalProfit * 100) / 100).toFixed(2) : 0}
                    </Column>
                </Row>
            </Column>
        </Row>
    }

    return (
        <Column >
            {lightAndDarkPricingComponent()}
        </Column>
    );
}

export default ShirtPricingComponent;