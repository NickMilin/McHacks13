import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockPantryItems, categoryColors, categoryLabels } from '@/lib/mockData'
import { TrendingUp, Apple, Wheat, Drumstick, Milk, Droplet } from 'lucide-react'

export function HealthStats() {
  // Calculate category distribution
  const categoryStats = useMemo(() => {
    const counts = {}
    mockPantryItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    
    return Object.entries(counts).map(([category, count]) => ({
      name: categoryLabels[category] || category,
      value: count,
      category,
      color: categoryColors[category] || categoryColors.other
    }))
  }, [])

  // Calculate percentages
  const totalItems = mockPantryItems.length
  const categoryPercentages = categoryStats.map(stat => ({
    ...stat,
    percentage: Math.round((stat.value / totalItems) * 100)
  }))

  // Recommended daily balance (simplified)
  const recommendedBalance = {
    vegetable: 40,
    fruit: 20,
    protein: 20,
    grain: 15,
    dairy: 5
  }

  // Calculate balance score
  const balanceScore = useMemo(() => {
    let score = 0
    const actualPercentages = {}
    
    categoryStats.forEach(stat => {
      actualPercentages[stat.category] = (stat.value / totalItems) * 100
    })

    Object.entries(recommendedBalance).forEach(([category, recommended]) => {
      const actual = actualPercentages[category] || 0
      const diff = Math.abs(recommended - actual)
      score += Math.max(0, 100 - diff * 2)
    })

    return Math.round(score / Object.keys(recommendedBalance).length)
  }, [categoryStats, totalItems])

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      vegetable: Apple,
      fruit: Apple,
      protein: Drumstick,
      grain: Wheat,
      dairy: Milk,
      fat: Droplet
    }
    return icons[category] || Apple
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Health Stats</h1>
        <p className="text-muted-foreground">
          Track your pantry's nutritional balance and food group distribution
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Balance Score</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              {balanceScore}
              <span className="text-lg text-muted-foreground">/100</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={balanceScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {balanceScore >= 80 ? '🌟 Excellent balance!' : 
               balanceScore >= 60 ? '👍 Good balance' : 
               '💡 Room for improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-4xl">{totalItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              across {categoryStats.length} food categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Category</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              {categoryStats.length > 0 && (
                <>
                  {categoryStats.sort((a, b) => b.value - a.value)[0]?.name}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {categoryStats[0]?.value} items ({categoryPercentages[0]?.percentage}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Food Group Distribution</CardTitle>
            <CardDescription>Visual breakdown of your pantry by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Comparison</CardTitle>
            <CardDescription>Number of items per food group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Your pantry composition compared to recommended balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryPercentages.map(stat => {
              const Icon = getCategoryIcon(stat.category)
              const recommended = recommendedBalance[stat.category] || 0
              
              return (
                <div key={stat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: stat.color }} />
                      </div>
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{stat.percentage}%</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        ({stat.value} items)
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={stat.percentage} className="h-2" />
                    {recommended > 0 && (
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-foreground"
                        style={{ left: `${recommended}%` }}
                        title={`Recommended: ${recommended}%`}
                      />
                    )}
                  </div>
                  {recommended > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Recommended: {recommended}% • 
                      {stat.percentage > recommended 
                        ? ` ${stat.percentage - recommended}% above target`
                        : stat.percentage < recommended 
                        ? ` ${recommended - stat.percentage}% below target`
                        : ' On target!'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Nutrition Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>🥬 Aim for vegetables to make up 40% of your pantry</li>
            <li>🍎 Include a variety of colorful fruits for essential vitamins</li>
            <li>🥩 Balance protein sources between meat, fish, and plant-based options</li>
            <li>🌾 Choose whole grains over refined options when possible</li>
            <li>🥛 Moderate dairy intake or choose calcium-fortified alternatives</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
