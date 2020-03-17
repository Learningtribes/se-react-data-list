import React,{Suspense} from "react";
import PropTypes from 'prop-types'
import "./component.scss"
import LeftIcon from "./chevron-left-solid.svg"
import RightIcon from "./chevron-right-solid.svg"
import Dropdown from 'se-react-dropdown'
import { useTranslation, withTranslation } from "react-i18next";
import './i18n'

class Component0 extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            pageNo:1 //props.pagination.pageNo
        };

        if (props.defaultLanguage){
            const {t, i18n}=this.props
            i18n.changeLanguage(props.defaultLanguage.replace('-','_'));
        }
    }

    resetPage() {
        this.setState({pageNo:1 })
    }

    firePageChange(){
        const {onPageChange} = this.props
        onPageChange && onPageChange(this.state.pageNo)
    }

    goPrevPage(e){
        if (e.currentTarget.classList.contains('disabled')) return
        this.setState((s,p)=>{
            let pageNo = s.pageNo - 1
            return {
                pageNo
            }
        },this.firePageChange)
    }

    goNextPage(e){
        if (e.currentTarget.classList.contains('disabled')) return
        this.setState((s,p)=>{
            let pageNo = s.pageNo + 1
            return {
                pageNo
            }
        },this.firePageChange)
    }

    switchPage(item){
        this.setState({pageNo:item.value}, this.firePageChange)
    }

    generatePagination(){
        const {pageNo} = this.state;
        const {pageSize, rowsCount} = this.props.pagination
        let pageCount = Math.ceil(rowsCount / pageSize)
        let pages = [...Array(pageCount).keys()].splice(1);
        pages = [...pages, pageCount || 1]
        pages = pages.map(p=>({value:p}))
        const { t } = this.props;

        return (<div className="pagination">
                    <LeftIcon onClick={this.goPrevPage.bind(this)} className={"prev-page"+ (pageNo<=1 ? " disabled" : '')}/>
                    <span>{t('Page')}</span>
                    <Dropdown data={pages} value={pageNo} onChange={this.switchPage.bind(this)}/>
                    <span>{t('of')} {pageCount}</span>
                    <RightIcon onClick={this.goNextPage.bind(this)}
                               className={'next-page' + (pageNo>pageCount-1 ? ' disabled' : '')}/>
                </div>)
    }

    getFieldsWithoutKeyField(){
        const {keyField,fields}=this.props
        return fields.filter(f=>f.fieldName && f.fieldName != keyField );
    }

    getHeader(){
        const {subFields} = this.props;
        const fields = this.getFieldsWithoutKeyField()
        return (
            <thead>
                <tr>
                    {fields.map(item=>{
                        const {colSpan}=item
                        const defaultRowSpan = subFields && !colSpan ? 2 : null
                        const {name, fieldName ,rowSpan=defaultRowSpan} = item;
                        const keyStr = fieldName
                        return <th key={keyStr} className={`${colSpan ? 'top-header':keyStr}`} rowSpan={rowSpan} colSpan={subFields && colSpan}>{name}</th>
                    })}

                </tr>
                {subFields && <tr>
                    {subFields.map(item=>{
                        const {name, fieldName, colSpan,rowSpan} = item;
                        const keyStr = fieldName.replace(/[- /:]/g,'_')
                        return <th key={keyStr} rowSpan={rowSpan} colSpan={colSpan}>{name}</th>
                    })}
                </tr>}

            </thead>
        )
    }

    getRow(row, index){
        const id = row[this.props.keyField || 'id'];
        const {subFields=[], cellRender} = this.props
        const fields = this.getFieldsWithoutKeyField()
        const DEFAULT_SIGN = '—'
        return (
            <tr key={id+'-'+index}>
                {fields && fields.length ? fields.filter(item=>item.colSpan ==null || item.colSpan=='')
                    .concat(subFields)
                    .map(item=>{
                    let cellValue = ''
                    const {name, fieldName, className=''} = item;
                    const isIncludeFieldName = Object.keys(row).includes(fieldName)
                    if (typeof(item.render)=='function'){
                            cellValue = item.render(row[fieldName])
                    }else{
                        if (isIncludeFieldName){
                            cellValue = row[fieldName]
                            cellValue = (cellValue == null || cellValue === '') ? DEFAULT_SIGN : cellValue.toString()
                        }else{
                            cellValue = DEFAULT_SIGN
                        }
                    }
                    if (cellValue && cellRender) {
                        cellValue = cellRender(cellValue)
                    }
                    return (<td key={name + '-' + fieldName} className={`${fieldName} ${className} `}>
                        {cellValue || ''}
                    </td>)
                }) : Object.keys(row).map(key=>{
                    let cellValue = row[key]
                    if (cellValue && cellRender) {
                        cellValue = cellRender(cellValue)
                    }
                    return (<td key={key.trim()} className={key.replace(' ','')}>{cellValue || DEFAULT_SIGN}</td>)
                })}
            </tr>
        )
    }

    getFooter(){
        const {totalData } = this.props;
        const fields = this.getFieldsWithoutKeyField()
        return (<tfoot>
            <tr>
                {
                    fields && fields.filter(p=>p!=null).map(item => {
                        const {name,fieldName} = item;
                        const cellValue = totalData[fieldName]
                        return <th key={name+'-'+fieldName}>{(cellValue == null) ? '' : cellValue.toString()}</th>
                    })
                }
            </tr>
        </tfoot>)
    }

    render() {
        const {data, pagination} = this.props;
        const fields = this.getFieldsWithoutKeyField()
        return (
            <div className={'se-react-data-list ' + (this.props.className || '')}>
                <div className="table-wrapper">
                    <table>
                        {this.getHeader()}
                        <tbody>
                        {(data.length <= 0)?
                            (<tr><td className="cell-notification" colSpan={fields && fields.length}>nothing</td></tr>) :
                            data.map((row,index) => {
                                return this.getRow(row, index)
                            }
                        )}
                        </tbody>
                        {this.getFooter()}
                    </table>
                </div>
                {this.props.enableRowsCount && (<div className="total-rows">Total:{pagination['rowsCount']} rows</div>)}
                {this.generatePagination()}
            </div>
        );
    }
}

const Component = withTranslation(undefined, { withRef: true })(Component0)
export default Component;

Component.propTypes = {
    className:PropTypes.string,
    enableRowsCount:PropTypes.bool,
    defaultLanguage:PropTypes.string,
    keyField:PropTypes.string,
    fields:PropTypes.arrayOf(PropTypes.exact({
        fieldName:PropTypes.string,
        name:PropTypes.string,
        colSpan:PropTypes.number,
        render:PropTypes.func,
        className:PropTypes.string
    })),
    subFields:PropTypes.arrayOf(PropTypes.exact({
        fieldName:PropTypes.string,
        name:PropTypes.string,
        colSpan:PropTypes.number,
        render:PropTypes.func,
        className:PropTypes.string
    })),
    pagination:PropTypes.exact({
        pageSize: PropTypes.number,
        rowsCount: PropTypes.number
    }),
    data:PropTypes.array,
    totalData: PropTypes.object,
    rowsCount: PropTypes.number,
    onPageChange:PropTypes.func,
    cellRender:PropTypes.func,
}