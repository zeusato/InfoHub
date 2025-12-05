// CMS Analytics Page - Traffic monitoring
import { useEffect, useState } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { getAnalyticsSummary, getTopArticles, getDailyViews } from '@/lib/analytics'
import { Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react'

// Register ECharts components
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer])

type Summary = { today: number; week: number; month: number }
type TopArticle = { path: string; views: number }
type DailyView = { date: string; views: number }

export default function Analytics() {
    const [summary, setSummary] = useState<Summary>({ today: 0, week: 0, month: 0 })
    const [topArticles, setTopArticles] = useState<TopArticle[]>([])
    const [dailyViews, setDailyViews] = useState<DailyView[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const [summaryData, topData, dailyData] = await Promise.all([
                    getAnalyticsSummary(),
                    getTopArticles(10),
                    getDailyViews(7),
                ])
                setSummary(summaryData)
                setTopArticles(topData)
                setDailyViews(dailyData)
            } catch (err) {
                console.error('Failed to load analytics:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Chart options for daily views
    const chartOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: 'rgba(255,255,255,0.1)',
            textStyle: { color: '#fff' },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: dailyViews.map(d => {
                const date = new Date(d.date)
                return `${date.getDate()}/${date.getMonth() + 1}`
            }),
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
            axisLabel: { color: 'rgba(255,255,255,0.6)' },
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
            axisLabel: { color: 'rgba(255,255,255,0.6)' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        },
        series: [
            {
                data: dailyViews.map(d => d.views),
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(251, 146, 60, 0.4)' },
                        { offset: 1, color: 'rgba(251, 146, 60, 0.05)' },
                    ]),
                },
                lineStyle: { color: '#fb923c', width: 3 },
                itemStyle: { color: '#fb923c' },
            },
        ],
    }

    const statCards = [
        { label: 'Hôm nay', value: summary.today, icon: Eye, color: 'from-orange-500/20 to-orange-600/20 border-orange-500/50' },
        { label: '7 ngày qua', value: summary.week, icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/50' },
        { label: '30 ngày qua', value: summary.month, icon: Calendar, color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50' },
    ]

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-brand" size={32} />
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
            </div>

            {loading ? (
                <div className="text-zinc-400">Đang tải dữ liệu...</div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {statCards.map((stat) => {
                            const Icon = stat.icon
                            return (
                                <div
                                    key={stat.label}
                                    className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-6 transition-transform hover:scale-105`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icon size={20} className="text-zinc-400" />
                                        <span className="text-zinc-400 text-sm font-medium">{stat.label}</span>
                                    </div>
                                    <div className="text-4xl font-bold text-white">{stat.value.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500 mt-1">lượt xem</div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Daily Views Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            📈 Lượt xem theo ngày
                        </h2>
                        <ReactEChartsCore
                            echarts={echarts}
                            option={chartOption}
                            style={{ height: '300px' }}
                            opts={{ renderer: 'canvas' }}
                        />
                    </div>

                    {/* Top Articles */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            🔥 Top bài viết được xem nhiều nhất
                        </h2>
                        {topArticles.length === 0 ? (
                            <div className="text-zinc-500 text-center py-8">
                                Chưa có dữ liệu. Hãy xem vài bài viết trong Workspace để bắt đầu tracking.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topArticles.map((article, index) => (
                                    <div
                                        key={article.path}
                                        className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    index === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                                                        index === 2 ? 'bg-orange-700/20 text-orange-400' :
                                                            'bg-white/10 text-zinc-500'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-white truncate max-w-md">{article.path}</span>
                                        </div>
                                        <span className="text-zinc-400 font-mono text-sm">
                                            {article.views.toLocaleString()} views
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
