import './indices-table.style.scss';

import _ from 'lodash';
import numeraljs from 'numeraljs';

class indicesTableController {
    constructor($sce, $filter) {
        'ngInject';

        this.$sce = $sce;
        this.$filter = $filter;

        // Pagination stuff
        this.totalItems = 1;
        this.currentPage = 1;
        this.maxSize = 7;
        this.itemsPerPage = 10;

        const formatNum = '0[.][0][0]a';
        const formatByt = '0[.][0][0]b'; 

        this.search = {text: ''}

        this.columns = [
            {
                label: 'Index',
                key: 'index_name'
            },
            {
                label: '# Docs',
                key: 'docs',
                formatter: formatNum
            },
            {
                label: 'Primary Shards',
                key: 'settings.number_of_shards',
                formatter: formatNum
            },
            {
                label: '# Replicas',
                key: 'settings.number_of_replicas',
                formatter: formatNum
            },
            {
                label: 'Size',
                key: 'size_in_bytes',
                formatter: formatByt
            },
            {
                label: 'Memory',
                key: 'fielddata.memory_size_in_bytes',
                formatter: formatByt
            },
        ]
    }

    $doCheck() {
        if(!angular.equals(this._data, this.indices)){
            console.log('--- saw change in indices', this.indices)
            this._data = this.indices;
            this.filterData();
        }
    }

    renderCell(obj, col){
        let val = _.get(obj, col.key);
        if (!col.formatter) return this.$sce.trustAsHtml(val);
        return this.$sce.trustAsHtml(numeraljs(val).format(col.formatter));
      }
    
      sortBy(col){
        if (this._sorter === col.key){
          if (this._order === 'desc'){
            // Reset and return original array
            this._sorter = undefined;
            this.sortReverse = undefined;
            return this.filterData();
          } else {
            // Default to Asc
            this.sortReverse = true;
          }
        } else {
          this._sorter = col.key;
          this.sortReverse = false;
        }
        this.filterData();
      }
    
      filterData(){
        console.log('--- filterData')
        let _data = [].concat(this._data || []);
        if (this.search.text.length) _data = this.$filter('filter')(_data, this.search.text)
        if (this._sorter){
          _data = (this.sortReverse) ?
                              _.orderBy(_data, this._sorter) :
                              _.orderBy(_data, this._sorter).reverse()
    
        }
    
        this.totalItems = _data.length;
        _data = _.chunk(_data, this.itemsPerPage);
        this.currentPage = 1;
        
        this.data = _data;
      }
}

export default indicesTableController;
